import { Injectable, computed, effect, signal } from '@angular/core';
import { INDICATORS, INDICATORS_MAP, LEVEL_VALUES } from '../../data/indicators.data';
import { InstrumentIndicators } from '../../shared/model/indicator.model';

export type { InstrumentIndicators, PivotLevels, VWAPLevels, VolumeProfile, OpeningRange, DayOHLC, WeekOHLC, OHLC } from '../../shared/model/indicator.model';

export interface ActiveLevelDisplay {
  levelId: string;
  groupName: string;
  groupDescription: string;
  label: string;
  description: string;
  value: number;
  delta: number;
}

const LEVEL_LABELS: Record<string, string> = {
  'pivots.r3': 'R3',       'pivots.r2': 'R2',     'pivots.r1': 'R1',
  'pivots.pivot': 'Pivot', 'pivots.s1': 'S1',     'pivots.s2': 'S2',     'pivots.s3': 'S3',
  'vwap.sd3': 'SD +3',     'vwap.sd2': 'SD +2',   'vwap.sd1': 'SD +1',
  'vwap.vwap': 'VWAP',
  'vwap.sm1': 'SD -1',     'vwap.sm2': 'SD -2',   'vwap.sm3': 'SD -3',
  'vp.vah': 'VAH',         'vp.poc': 'POC',        'vp.val': 'VAL',
  'or.high': 'OR High',    'or.low': 'OR Low',
  'pd.asia.open':  'Asia O',   'pd.asia.high':  'Asia H',   'pd.asia.low':  'Asia L',  'pd.asia.close':  'Asia C',
  'pd.lon.open':   'Lon O',    'pd.lon.high':   'Lon H',    'pd.lon.low':   'Lon L',   'pd.lon.close':   'Lon C',
  'pd.ny.open':    'NY O',     'pd.ny.high':    'NY H',     'pd.ny.low':    'NY L',    'pd.ny.close':    'NY C',
  'wk.open':  'Wk O',     'wk.high':  'Wk H',    'wk.low':  'Wk L',    'wk.close': 'Wk C',
};

const LEVEL_GROUPS: Record<string, string> = {
  'pivots.r3': 'Pivots',  'pivots.r2': 'Pivots',  'pivots.r1': 'Pivots',
  'pivots.pivot': 'Pivots', 'pivots.s1': 'Pivots', 'pivots.s2': 'Pivots', 'pivots.s3': 'Pivots',
  'vwap.sd3': 'VWAP',     'vwap.sd2': 'VWAP',     'vwap.sd1': 'VWAP',
  'vwap.vwap': 'VWAP',    'vwap.sm1': 'VWAP',     'vwap.sm2': 'VWAP',    'vwap.sm3': 'VWAP',
  'vp.vah': 'Vol Profile', 'vp.poc': 'Vol Profile', 'vp.val': 'Vol Profile',
  'or.high': 'Opening Rng', 'or.low': 'Opening Rng',
  'pd.asia.open':  'Prev Day', 'pd.asia.high':  'Prev Day', 'pd.asia.low':  'Prev Day', 'pd.asia.close':  'Prev Day',
  'pd.lon.open':   'Prev Day', 'pd.lon.high':   'Prev Day', 'pd.lon.low':   'Prev Day', 'pd.lon.close':   'Prev Day',
  'pd.ny.open':    'Prev Day', 'pd.ny.high':    'Prev Day', 'pd.ny.low':    'Prev Day', 'pd.ny.close':    'Prev Day',
  'wk.open': 'Weekly', 'wk.high': 'Weekly', 'wk.low': 'Weekly', 'wk.close': 'Weekly',
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  'Pivots':      'Classic floor-trader pivot points calculated from the prior session’s high, low, and close.',
  'VWAP':        'Volume-weighted average price and standard deviation bands for the current session.',
  'Vol Profile': 'Price levels where the most trading volume occurred during the session.',
  'Opening Rng': 'The high and low of the opening range window at the start of the session.',
  'Prev Day':    'Open, high, low, and close from the prior session’s Asia, London, and New York windows.',
  'Weekly':      'Open, high, low, and close from the prior trading week.',
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  'pivots.r3':    'R3 (Resistance 3)',
  'pivots.r2':    'R2 (Resistance 2)',
  'pivots.r1':    'R1 (Resistance 1)',
  'pivots.pivot': 'Pivot',
  'pivots.s1':    'S1 (Support 1)',
  'pivots.s2':    'S2 (Support 2)',
  'pivots.s3':    'S3 (Support 3)',
  'vwap.sd3': 'Standard Deviation +3',
  'vwap.sd2': 'Standard Deviation +2',
  'vwap.sd1': 'Standard Deviation +1',
  'vwap.vwap': 'VWAP',
  'vwap.sm1': 'Standard Deviation -1',
  'vwap.sm2': 'Standard Deviation -2',
  'vwap.sm3': 'Standard Deviation -3',
  'vp.vah': 'Value Area High ',
  'vp.poc': 'Point of Control',
  'vp.val': 'Value Area Low',
  'or.high': 'Opening Range High',
  'or.low':  'Opening Range Low',
  'pd.asia.open':  'Asia Open',
  'pd.asia.high':  'Asia High',
  'pd.asia.low':   'Asia Low',
  'pd.asia.close': 'Asia Close',
  'pd.lon.open':   'London Open',
  'pd.lon.high':   'London High',
  'pd.lon.low':    'London Low',
  'pd.lon.close':  'London Close',
  'pd.ny.open':    'New York Open',
  'pd.ny.high':    'New York High',
  'pd.ny.low':     'New York Low',
  'pd.ny.close':   'New York Close',
  'wk.open':  'Weekly Open',
  'wk.high':  'Weekly High',
  'wk.low':   'Weekly Low',
  'wk.close': 'Weekly Close',
};

const STORAGE_LEVELS = 'mw.activeLevels';

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

@Injectable({ providedIn: 'root' })
export class IndicatorService {
  private readonly _indicators = signal<InstrumentIndicators[]>(INDICATORS);

  readonly indicators  = this._indicators.asReadonly();
  readonly dayDates:  string[] = INDICATORS[0]?.prevDayOHLC.map(d => d.date)  ?? [];
  readonly weekDates: string[] = INDICATORS[0]?.weeklyOHLC.map(w => w.weekOf) ?? [];

  // ── Selection state (shared with indicators admin and market overview) ──────
  readonly activeLevels = signal<Set<string>>(loadSet(STORAGE_LEVELS));
  readonly totalActive  = computed(() => this.activeLevels().size);

  constructor() {
    effect(() => localStorage.setItem(STORAGE_LEVELS, JSON.stringify([...this.activeLevels()])));
  }

  // ── Selection methods ────────────────────────────────────────────────────────
  isLevelActive(levelId: string): boolean {
    return this.activeLevels().has(levelId);
  }

  toggleLevel(levelId: string): void {
    this.activeLevels.update(set => {
      const next = new Set(set);
      next.has(levelId) ? next.delete(levelId) : next.add(levelId);
      return next;
    });
  }

  isGroupAllActive(levelIds: string[]): boolean {
    const active = this.activeLevels();
    return levelIds.length > 0 && levelIds.every(id => active.has(id));
  }

  toggleGroupLevels(levelIds: string[]): void {
    const selectAll = !this.isGroupAllActive(levelIds);
    this.activeLevels.update(set => {
      const next = new Set(set);
      levelIds.forEach(id => selectAll ? next.add(id) : next.delete(id));
      return next;
    });
  }

  countActiveLevels(levelIds: string[]): number {
    const active = this.activeLevels();
    return levelIds.filter(id => active.has(id)).length;
  }

  // ── Lookup methods ───────────────────────────────────────────────────────────
  getBySymbol(symbol: string): InstrumentIndicators | undefined {
    return INDICATORS_MAP.get(symbol);
  }

  getLevelValue(symbol: string, levelId: string): number | undefined {
    return LEVEL_VALUES.get(symbol)?.[levelId];
  }

  getLevelValues(symbol: string): Record<string, number> | undefined {
    return LEVEL_VALUES.get(symbol);
  }

  getActiveLevelsForInstrument(symbol: string, bid: number): ActiveLevelDisplay[] {
    const values = LEVEL_VALUES.get(symbol);
    if (!values) return [];
    return [...this.activeLevels()]
      .map(levelId => {
        const groupName = LEVEL_GROUPS[levelId] ?? '';
        return {
          levelId,
          groupName,
          groupDescription: GROUP_DESCRIPTIONS[groupName] ?? '',
          label: LEVEL_LABELS[levelId] ?? levelId,
          description: LEVEL_DESCRIPTIONS[levelId] ?? '',
          value: values[levelId] ?? 0,
          delta: (values[levelId] ?? 0) - bid,
        };
      })
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
  }
}