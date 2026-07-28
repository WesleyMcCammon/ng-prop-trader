// Shapes returned by the MarketWatchAPI backend (ForexPairsController, FuturesContractsController,
// ForexIndicatorsController, FuturesIndicatorsController). Kept separate from the frontend's own
// FuturesContract/InstrumentIndicators models since the backend DTOs are much leaner.

export interface ApiForexPair {
  symbol: string;
  pricePrecision: number;
}

export interface ApiForexPairsResponse {
  major: ApiForexPair[];
  minor: ApiForexPair[];
}

export type ApiFuturesCategory = 'Indices' | 'Metals' | 'Currencies' | 'InterestRates' | 'Energy';

export interface ApiFuturesContract {
  symbol: string;
  name: string;
  category: ApiFuturesCategory;
  exchange: string;
  isEMini: boolean;
  isMicro: boolean;
  pricePrecision: number;
}

export interface ApiFuturesContractsResponse {
  indices: ApiFuturesContract[];
  metals: ApiFuturesContract[];
  currencies: ApiFuturesContract[];
  interestRates: ApiFuturesContract[];
  energy: ApiFuturesContract[];
}

export interface ApiOhlcBar {
  periodStart: string; // yyyy-MM-dd
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ApiPivotPoints {
  r3: number;
  r2: number;
  r1: number;
  pp: number;
  s1: number;
  s2: number;
  s3: number;
}

export interface ApiVwapLevels {
  vwap: number;
  stdDevPlus1: number;
  stdDevPlus2: number;
  stdDevPlus3: number;
  stdDevMinus1: number;
  stdDevMinus2: number;
  stdDevMinus3: number;
}

export interface ApiVolumeProfile {
  pointOfControl: number;
  valueAreaHigh: number;
  valueAreaLow: number;
}

export interface ApiInstrumentIndicators {
  symbol: string;
  pricePrecision: number;
  pivots: ApiPivotPoints;
  weeklyOhlc: ApiOhlcBar[];
  dailyOhlc: ApiOhlcBar[];
  asiaSessionOhlc: ApiOhlcBar[];
  londonSessionOhlc: ApiOhlcBar[];
  newYorkSessionOhlc: ApiOhlcBar[];
  vwap: ApiVwapLevels;
  volumeProfile: ApiVolumeProfile;
}

export interface ApiFuturesIndicatorsResponse {
  indices: ApiInstrumentIndicators[];
  metals: ApiInstrumentIndicators[];
  currencies: ApiInstrumentIndicators[];
  interestRates: ApiInstrumentIndicators[];
  energy: ApiInstrumentIndicators[];
}

export interface ApiCfdInstrument {
  symbol: string;
  name: string;
  pricePrecision: number;
}

// Streamed over the /ws/quotes websocket. Serialized with the default (PascalCase) System.Text.Json
// naming, unlike the controller responses above, since it bypasses ASP.NET's MVC JSON options.
export interface ApiQuote {
  Symbol: string;
  Bid: number;
  Ask: number;
  Last: number;
  Timestamp: string;
}
