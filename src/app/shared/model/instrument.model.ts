export type InstrumentType = 'futures' | 'forex' | 'cfd';

export type InstrumentCategory =
  | 'Currencies'
  | 'Energies'
  | 'Financials'
  | 'Indices'
  | 'Metals'
  | 'Forex Majors'
  | 'Forex Minors'
  | 'CFDs';

export interface CategoryDescriptor {
  name: InstrumentCategory;
  type: InstrumentType;
}

export interface FuturesContract {
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
  bid: number;
  ask: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}
