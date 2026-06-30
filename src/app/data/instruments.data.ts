import { FuturesContract, InstrumentCategory, InstrumentType } from '../shared/model/instrument.model';

interface RawInstrument {
  symbol: string;
  name: string;
  type: InstrumentType;
  category: InstrumentCategory;
  exchange: string;
  currency: string;
  contractSize: number;
  tickSize: number;
  tickValue: number;
  price: number;
  changePct: number;
  spreadTicks?: number;
  volume?: number;
}

function build(r: RawInstrument): FuturesContract {
  const spread = r.tickSize * (r.spreadTicks ?? 1);
  const change = parseFloat((r.price * r.changePct / 100).toPrecision(6));
  const open   = parseFloat((r.price - change).toPrecision(8));
  const swing  = Math.abs(change) + r.tickSize * 4;
  const high   = parseFloat((Math.max(r.price, open) + swing).toPrecision(8));
  const low    = parseFloat((Math.min(r.price, open) - swing).toPrecision(8));
  const bid    = parseFloat((r.price - spread / 2).toPrecision(8));
  const ask    = parseFloat((r.price + spread / 2).toPrecision(8));
  return {
    symbol: r.symbol, name: r.name, type: r.type, category: r.category,
    exchange: r.exchange, currency: r.currency,
    contractSize: r.contractSize, tickSize: r.tickSize, tickValue: r.tickValue,
    price: r.price, bid, ask,
    change, changePct: r.changePct,
    high, low, open,
    volume: r.volume ?? 50_000,
  };
}

// ── Futures – Indices ──────────────────────────────────────────────────────────
const INDICES: RawInstrument[] = [
  { symbol: '/ES',  name: 'E-mini S&P 500',         type: 'futures', category: 'Indices', exchange: 'CME',  currency: 'USD', contractSize: 50,        tickSize: 0.25,   tickValue: 12.50,  price: 5480.25,   changePct:  0.42, volume: 980_000 },
  { symbol: '/NQ',  name: 'E-mini NASDAQ-100',       type: 'futures', category: 'Indices', exchange: 'CME',  currency: 'USD', contractSize: 20,        tickSize: 0.25,   tickValue:  5.00,  price: 19_612.50, changePct:  0.67, volume: 420_000 },
  { symbol: '/YM',  name: 'E-mini Dow',              type: 'futures', category: 'Indices', exchange: 'CBOT', currency: 'USD', contractSize: 5,         tickSize: 1,      tickValue:  5.00,  price: 43_215,    changePct: -0.12, volume: 140_000 },
  { symbol: '/RTY', name: 'E-mini Russell 2000',     type: 'futures', category: 'Indices', exchange: 'CME',  currency: 'USD', contractSize: 50,        tickSize: 0.10,   tickValue:  5.00,  price: 2_098.40,  changePct:  0.48, volume:  85_000 },
  { symbol: '/MES', name: 'Micro E-mini S&P 500',    type: 'futures', category: 'Indices', exchange: 'CME',  currency: 'USD', contractSize: 5,         tickSize: 0.25,   tickValue:  1.25,  price: 5480.25,   changePct:  0.42, volume: 620_000 },
  { symbol: '/MNQ', name: 'Micro E-mini NASDAQ-100', type: 'futures', category: 'Indices', exchange: 'CME',  currency: 'USD', contractSize: 2,         tickSize: 0.25,   tickValue:  0.50,  price: 19_612.50, changePct:  0.67, volume: 310_000 },
  { symbol: '/MYM', name: 'Micro E-mini Dow',        type: 'futures', category: 'Indices', exchange: 'CBOT', currency: 'USD', contractSize: 0.5,       tickSize: 1,      tickValue:  0.50,  price: 43_215,    changePct: -0.12, volume:  72_000 },
  { symbol: '/M2K', name: 'Micro E-mini Russell 2000', type: 'futures', category: 'Indices', exchange: 'CME', currency: 'USD', contractSize: 5,       tickSize: 0.10,   tickValue:  0.50,  price: 2_098.40,  changePct:  0.48, volume:  48_000 },
];

// ── Futures – Metals ───────────────────────────────────────────────────────────
const METALS: RawInstrument[] = [
  { symbol: '/GC',  name: 'Gold',          type: 'futures', category: 'Metals', exchange: 'COMEX', currency: 'USD', contractSize: 100,  tickSize: 0.10,   tickValue: 10.00,  price: 3_248.60,  changePct:  0.38, volume: 210_000 },
  { symbol: '/SI',  name: 'Silver',        type: 'futures', category: 'Metals', exchange: 'COMEX', currency: 'USD', contractSize: 5000, tickSize: 0.005,  tickValue: 25.00,  price: 32.485,    changePct:  0.72, volume:  95_000 },
  { symbol: '/HG',  name: 'Copper',        type: 'futures', category: 'Metals', exchange: 'COMEX', currency: 'USD', contractSize: 25000,tickSize: 0.0005, tickValue: 12.50,  price: 4.6240,    changePct: -0.21, volume:  62_000 },
  { symbol: '/PL',  name: 'Platinum',      type: 'futures', category: 'Metals', exchange: 'NYMEX', currency: 'USD', contractSize: 50,   tickSize: 0.10,   tickValue:  5.00,  price: 1_018.50,  changePct:  0.15, volume:  18_000 },
  { symbol: '/PA',  name: 'Palladium',     type: 'futures', category: 'Metals', exchange: 'NYMEX', currency: 'USD', contractSize: 100,  tickSize: 0.05,   tickValue:  5.00,  price: 1_124.00,  changePct: -0.44, volume:   6_000 },
  { symbol: '/MGC', name: 'Micro Gold',    type: 'futures', category: 'Metals', exchange: 'COMEX', currency: 'USD', contractSize: 10,   tickSize: 0.10,   tickValue:  1.00,  price: 3_248.60,  changePct:  0.38, volume: 145_000 },
  { symbol: '/SIL', name: 'Micro Silver',  type: 'futures', category: 'Metals', exchange: 'COMEX', currency: 'USD', contractSize: 1000, tickSize: 0.005,  tickValue:  5.00,  price: 32.485,    changePct:  0.72, volume:  38_000 },
];

// ── Futures – Energies ─────────────────────────────────────────────────────────
const ENERGIES: RawInstrument[] = [
  { symbol: '/CL',  name: 'Crude Oil WTI',   type: 'futures', category: 'Energies', exchange: 'NYMEX', currency: 'USD', contractSize: 1000, tickSize: 0.01,   tickValue: 10.00, price: 78.42,  changePct: -0.83, volume: 480_000 },
  { symbol: '/BRN', name: 'Brent Crude Oil', type: 'futures', category: 'Energies', exchange: 'ICE',   currency: 'USD', contractSize: 1000, tickSize: 0.01,   tickValue: 10.00, price: 82.18,  changePct: -0.61, volume: 340_000 },
  { symbol: '/NG',  name: 'Natural Gas',     type: 'futures', category: 'Energies', exchange: 'NYMEX', currency: 'USD', contractSize: 10000,tickSize: 0.001,  tickValue: 10.00, price: 2.847,  changePct:  1.24, volume: 220_000 },
  { symbol: '/HO',  name: 'Heating Oil',     type: 'futures', category: 'Energies', exchange: 'NYMEX', currency: 'USD', contractSize: 42000,tickSize: 0.0001, tickValue:  4.20, price: 2.4483, changePct: -0.52, volume:  55_000 },
  { symbol: '/RB',  name: 'RBOB Gasoline',   type: 'futures', category: 'Energies', exchange: 'NYMEX', currency: 'USD', contractSize: 42000,tickSize: 0.0001, tickValue:  4.20, price: 2.6851, changePct: -0.34, volume:  62_000 },
  { symbol: '/MCL', name: 'Micro Crude Oil', type: 'futures', category: 'Energies', exchange: 'NYMEX', currency: 'USD', contractSize: 100,  tickSize: 0.01,   tickValue:  1.00, price: 78.42,  changePct: -0.83, volume: 120_000 },
];

// ── Futures – Financials ───────────────────────────────────────────────────────
const FINANCIALS: RawInstrument[] = [
  { symbol: '/ZN', name: '10-Year T-Note',   type: 'futures', category: 'Financials', exchange: 'CBOT', currency: 'USD', contractSize: 100_000, tickSize: 0.015625, tickValue: 15.625, price: 109.515625, changePct:  0.18, volume: 1_200_000 },
  { symbol: '/ZB', name: '30-Year T-Bond',   type: 'futures', category: 'Financials', exchange: 'CBOT', currency: 'USD', contractSize: 100_000, tickSize: 0.03125,  tickValue: 31.25,  price: 116.09375,  changePct:  0.22, volume:   420_000 },
  { symbol: '/ZF', name: '5-Year T-Note',    type: 'futures', category: 'Financials', exchange: 'CBOT', currency: 'USD', contractSize: 100_000, tickSize: 0.0078125,tickValue:  7.8125,price: 106.453125, changePct:  0.11, volume:   680_000 },
  { symbol: '/ZT', name: '2-Year T-Note',    type: 'futures', category: 'Financials', exchange: 'CBOT', currency: 'USD', contractSize: 200_000, tickSize: 0.0078125,tickValue: 15.625, price: 102.78125,  changePct:  0.07, volume:   310_000 },
  { symbol: '/ZQ', name: '30-Day Fed Funds', type: 'futures', category: 'Financials', exchange: 'CBOT', currency: 'USD', contractSize: 5_000_000,tickSize: 0.005, tickValue: 20.833, price: 95.4125,    changePct:  0.01, volume:   140_000 },
];

// ── Futures – Currencies ───────────────────────────────────────────────────────
const CURRENCIES: RawInstrument[] = [
  // Standard contracts
  { symbol: '/6E',  name: 'Euro FX',              type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 125_000,    tickSize: 0.00005,   tickValue:  6.25, price: 1.08545,  changePct:  0.23, volume: 240_000 },
  { symbol: '/6B',  name: 'British Pound',         type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize:  62_500,    tickSize: 0.0001,    tickValue:  6.25, price: 1.27185,  changePct:  0.14, volume: 115_000 },
  { symbol: '/6J',  name: 'Japanese Yen',          type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 12_500_000, tickSize: 0.0000005, tickValue:  6.25, price: 0.006582, changePct: -0.18, volume:  98_000 },
  { symbol: '/6A',  name: 'Australian Dollar',     type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 100_000,    tickSize: 0.0001,    tickValue: 10.00, price: 0.64820,  changePct:  0.31, volume:  72_000 },
  { symbol: '/6C',  name: 'Canadian Dollar',       type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 100_000,    tickSize: 0.0001,    tickValue: 10.00, price: 0.73215,  changePct: -0.08, volume:  54_000 },
  { symbol: '/6S',  name: 'Swiss Franc',           type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 125_000,    tickSize: 0.0001,    tickValue: 12.50, price: 1.12385,  changePct:  0.19, volume:  42_000 },
  { symbol: '/6N',  name: 'New Zealand Dollar',    type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 100_000,    tickSize: 0.0001,    tickValue: 10.00, price: 0.59840,  changePct:  0.25, volume:  28_000 },
  // Micro contracts
  { symbol: '/M6E', name: 'Micro Euro FX',         type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize:  12_500,    tickSize: 0.0001,    tickValue:  1.25, price: 1.08545,  changePct:  0.23, volume: 180_000 },
  { symbol: '/M6B', name: 'Micro British Pound',   type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize:   6_250,    tickSize: 0.0001,    tickValue:  0.625,price: 1.27185,  changePct:  0.14, volume:  88_000 },
  { symbol: '/M6J', name: 'Micro Japanese Yen',    type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 1_250_000,  tickSize: 0.000001,  tickValue:  1.25, price: 0.006582, changePct: -0.18, volume:  62_000 },
  { symbol: '/M6A', name: 'Micro Australian Dollar',type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize:  10_000,   tickSize: 0.0001,    tickValue:  1.00, price: 0.64820,  changePct:  0.31, volume:  55_000 },
  { symbol: '/M6C', name: 'Micro Canadian Dollar', type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize:  10_000,    tickSize: 0.0001,    tickValue:  1.00, price: 0.73215,  changePct: -0.08, volume:  38_000 },
  { symbol: '/M6S', name: 'Micro Swiss Franc',     type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize:  12_500,    tickSize: 0.0001,    tickValue:  1.25, price: 1.12385,  changePct:  0.19, volume:  32_000 },
  { symbol: '/M6N', name: 'Micro New Zealand Dollar', type: 'futures', category: 'Currencies', exchange: 'CME', currency: 'USD', contractSize: 10_000,  tickSize: 0.0001,    tickValue:  1.00, price: 0.59840,  changePct:  0.25, volume:  22_000 },
];

// ── Forex – Majors ─────────────────────────────────────────────────────────────
const FOREX_MAJORS: RawInstrument[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar',         type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'USD', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 1.08548, changePct:  0.23, spreadTicks: 10, volume: 0 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'USD', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 1.27192, changePct:  0.14, spreadTicks: 15, volume: 0 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'JPY', contractSize: 100_000, tickSize: 0.001,   tickValue: 1.00, price: 152.418, changePct: -0.18, spreadTicks:  9, volume: 0 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc',  type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'CHF', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 0.88962, changePct: -0.19, spreadTicks: 12, volume: 0 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'CAD', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 1.36584, changePct:  0.08, spreadTicks: 15, volume: 0 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'USD', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 0.64817, changePct:  0.31, spreadTicks: 15, volume: 0 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex', category: 'Forex Majors', exchange: 'OTC', currency: 'USD', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 0.59843, changePct:  0.25, spreadTicks: 20, volume: 0 },
];

// ── Forex – Minors ─────────────────────────────────────────────────────────────
const FOREX_MINORS: RawInstrument[] = [
  { symbol: 'EUR/GBP', name: 'Euro / British Pound',          type: 'forex', category: 'Forex Minors', exchange: 'OTC', currency: 'GBP', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 0.85342, changePct:  0.09, spreadTicks: 20, volume: 0 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen',           type: 'forex', category: 'Forex Minors', exchange: 'OTC', currency: 'JPY', contractSize: 100_000, tickSize: 0.001,   tickValue: 1.00, price: 165.412, changePct:  0.05, spreadTicks: 15, volume: 0 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', type: 'forex', category: 'Forex Minors', exchange: 'OTC', currency: 'JPY', contractSize: 100_000, tickSize: 0.001,   tickValue: 1.00, price: 193.762, changePct: -0.04, spreadTicks: 20, volume: 0 },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', type: 'forex', category: 'Forex Minors', exchange: 'OTC', currency: 'JPY', contractSize: 100_000, tickSize: 0.001, tickValue: 1.00, price:  98.842, changePct:  0.13, spreadTicks: 22, volume: 0 },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc',            type: 'forex', category: 'Forex Minors', exchange: 'OTC', currency: 'CHF', contractSize: 100_000, tickSize: 0.00001, tickValue: 1.00, price: 0.96418, changePct:  0.04, spreadTicks: 25, volume: 0 },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', type: 'forex', category: 'Forex Minors', exchange: 'OTC', currency: 'JPY', contractSize: 100_000, tickSize: 0.001,  tickValue: 1.00, price: 111.628, changePct: -0.10, spreadTicks: 22, volume: 0 },
];

// ── CFDs ───────────────────────────────────────────────────────────────────────
const CFDS: RawInstrument[] = [
  { symbol: 'US500',  name: 'US 500 (S&P 500)',     type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.1,   tickValue: 0.10, price: 5_479.8,  changePct:  0.42, spreadTicks: 4, volume: 0 },
  { symbol: 'USTEC',  name: 'US Tech 100 (NASDAQ)', type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.1,   tickValue: 0.10, price: 19_608.5, changePct:  0.67, spreadTicks: 5, volume: 0 },
  { symbol: 'US30',   name: 'US 30 (Dow Jones)',     type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 1,     tickValue: 1.00, price: 43_212,   changePct: -0.12, spreadTicks: 3, volume: 0 },
  { symbol: 'XAUUSD', name: 'Gold (Spot)',           type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.01,  tickValue: 0.01, price: 3_247.42, changePct:  0.38, spreadTicks: 35,volume: 0 },
  { symbol: 'WTIUSD', name: 'Crude Oil WTI (Spot)',  type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.001, tickValue: 0.001,price: 78.384,   changePct: -0.83, spreadTicks: 30,volume: 0 },
  { symbol: 'BRTUSD', name: 'Brent Crude (Spot)',    type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.001, tickValue: 0.001,price: 82.147,   changePct: -0.61, spreadTicks: 35,volume: 0 },
  { symbol: 'NGAS',   name: 'Natural Gas (Spot)',    type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.001, tickValue: 0.001,price: 2.8462,   changePct:  1.24, spreadTicks: 50,volume: 0 },
  { symbol: 'XAGUSD', name: 'Silver (Spot)',         type: 'cfd', category: 'CFDs', exchange: 'OTC', currency: 'USD', contractSize: 1, tickSize: 0.001, tickValue: 0.001,price: 32.452,   changePct:  0.72, spreadTicks: 50,volume: 0 },
];

export const INSTRUMENTS: FuturesContract[] = [
  ...INDICES,
  ...METALS,
  ...ENERGIES,
  ...FINANCIALS,
  ...CURRENCIES,
  ...FOREX_MAJORS,
  ...FOREX_MINORS,
  ...CFDS,
].map(build);
