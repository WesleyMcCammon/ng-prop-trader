import { FuturesContract } from '../shared/model/instrument.model';
import {
  InstrumentIndicators, OHLC, DayOHLC, WeekOHLC,
  PivotLevels, VWAPLevels, VolumeProfile, OpeningRange,
} from '../shared/model/indicator.model';
import { INSTRUMENTS } from './instruments.data';

// ── Helpers ────────────────────────────────────────────────────────────────────

function snap(value: number, tick: number): number {
  return parseFloat((Math.round(value / tick) * tick).toPrecision(12));
}

function buildOHLC(open: number, close: number, swing: number, tick: number): OHLC {
  return {
    open:  snap(open,                              tick),
    high:  snap(Math.max(open, close) + swing,     tick),
    low:   snap(Math.min(open, close) - swing * 0.9, tick),
    close: snap(close,                             tick),
  };
}

// ── Configuration ──────────────────────────────────────────────────────────────

// Typical day range as a fraction of price, keyed by category
const DAY_RANGE_SCALE: Record<string, number> = {
  'Indices':      0.012,
  'Metals':       0.010,
  'Energies':     0.015,
  'Financials':   0.006,
  'Currencies':   0.008,
  'Forex Majors': 0.007,
  'Forex Minors': 0.009,
  'CFDs':         0.012,
};

// Past 5 business days (most recent first). Today = 2026-07-01 (Tuesday).
const DAY_DATES   = ['2026-06-30', '2026-06-27', '2026-06-26', '2026-06-25', '2026-06-24'];
// Each day's approximate close relative to current price
const DAY_CHG_PCT = [-0.0042, 0.0018, -0.0063, 0.0031, -0.0028];
// Day direction: +1 = bullish (close > open), -1 = bearish
const DAY_DIR     = [-1, 1, -1, 1, -1];

// Past 5 week starts (Mondays, most recent first)
const WEEK_DATES   = ['2026-06-29', '2026-06-22', '2026-06-15', '2026-06-08', '2026-06-01'];
const WEEK_CHG_PCT = [-0.012, 0.022, -0.018, 0.031, -0.024];
const WEEK_DIR     = [-1, 1, -1, 1, -1];

// ── Session OHLC builder ───────────────────────────────────────────────────────

function buildDayOHLC(date: string, dayClose: number, dr: number, dir: number, tick: number): DayOHLC {
  // Each session contributes a portion of the day's directional move.
  // Asia → London → New York: sessions chain so London opens near Asia's close, etc.
  const asiaMov  = dir * dr * 0.25;
  const lonMov   = dir * dr * 0.42;
  const nyMov    = dir * dr * 0.33;

  const nyOpen   = dayClose   - nyMov;
  const lonClose = nyOpen;
  const lonOpen  = lonClose   - lonMov;
  const asiaClose= lonOpen;
  const asiaOpen = asiaClose  - asiaMov;

  return {
    date,
    asia:    buildOHLC(asiaOpen,  asiaClose,  dr * 0.12, tick),
    london:  buildOHLC(lonOpen,   lonClose,   dr * 0.22, tick),
    newYork: buildOHLC(nyOpen,    dayClose,   dr * 0.18, tick),
  };
}

// ── Main factory ───────────────────────────────────────────────────────────────

function buildIndicators(inst: FuturesContract): InstrumentIndicators {
  const { symbol, price, tickSize, category } = inst;
  const dr = price * (DAY_RANGE_SCALE[category] ?? 0.010);

  // ── Previous 5 days × 3 sessions ──────────────────────────────────────────
  const prevDayOHLC: DayOHLC[] = DAY_DATES.map((date, d) =>
    buildDayOHLC(
      date,
      price * (1 + DAY_CHG_PCT[d]),
      dr,
      DAY_DIR[d],
      tickSize,
    )
  );

  // ── Previous 5 weeks ──────────────────────────────────────────────────────
  const weeklyOHLC: WeekOHLC[] = WEEK_DATES.map((weekOf, w) => {
    const wClose = price * (1 + WEEK_CHG_PCT[w]);
    const wr     = dr * 3.8;
    const wDir   = WEEK_DIR[w];
    const wOpen  = wClose - wDir * wr * 0.50;
    return {
      weekOf,
      open:  snap(wOpen,                                tickSize),
      high:  snap(Math.max(wOpen, wClose) + wr * 0.40,  tickSize),
      low:   snap(Math.min(wOpen, wClose) - wr * 0.35,  tickSize),
      close: snap(wClose,                               tickSize),
    };
  });

  // ── Pivots — calculated from yesterday's combined H/L/C ───────────────────
  const yest = prevDayOHLC[0];
  const yH   = Math.max(yest.asia.high,  yest.london.high,  yest.newYork.high);
  const yL   = Math.min(yest.asia.low,   yest.london.low,   yest.newYork.low);
  const yC   = yest.newYork.close;
  const pp   = snap((yH + yL + yC) / 3, tickSize);
  const pivots: PivotLevels = {
    r3:    snap(yH + 2 * (pp - yL),  tickSize),
    r2:    snap(pp + (yH - yL),       tickSize),
    r1:    snap(2 * pp - yL,          tickSize),
    pivot: pp,
    s1:    snap(2 * pp - yH,          tickSize),
    s2:    snap(pp - (yH - yL),       tickSize),
    s3:    snap(yL - 2 * (yH - pp),   tickSize),
  };

  // ── VWAP — anchored near current price, SD bands at 0.55× day range ───────
  const sd         = dr * 0.55;
  const vwapLevel  = snap(price + dr * 0.07, tickSize);
  const vwap: VWAPLevels = {
    sdPlus3:  snap(vwapLevel + 3 * sd, tickSize),
    sdPlus2:  snap(vwapLevel + 2 * sd, tickSize),
    sdPlus1:  snap(vwapLevel + 1 * sd, tickSize),
    vwap:     vwapLevel,
    sdMinus1: snap(vwapLevel - 1 * sd, tickSize),
    sdMinus2: snap(vwapLevel - 2 * sd, tickSize),
    sdMinus3: snap(vwapLevel - 3 * sd, tickSize),
  };

  // ── Volume Profile — POC near current price, VA covers ~70% of day range ──
  const poc = snap(price + dr * 0.05, tickSize);
  const volumeProfile: VolumeProfile = {
    valueAreaHigh:  snap(poc + dr * 0.55, tickSize),
    pointOfControl: poc,
    valueAreaLow:   snap(poc - dr * 0.50, tickSize),
  };

  // ── Opening Range — first 30 min of the NY session ────────────────────────
  const orMid = snap(price - dr * 0.06, tickSize);
  const orHalf = snap(dr * 0.16, tickSize);
  const openingRange: OpeningRange = {
    high: snap(orMid + orHalf, tickSize),
    low:  snap(orMid - orHalf, tickSize),
  };

  return { symbol, pivots, prevDayOHLC, weeklyOHLC, vwap, volumeProfile, openingRange };
}

// ── Exports ────────────────────────────────────────────────────────────────────

export const INDICATORS: InstrumentIndicators[] = INSTRUMENTS.map(buildIndicators);

export const INDICATORS_MAP = new Map<string, InstrumentIndicators>(
  INDICATORS.map(ind => [ind.symbol, ind])
);
