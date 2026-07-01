export interface OHLC {
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

export interface DayOHLC {
  date:    string;   // YYYY-MM-DD
  asia:    OHLC;
  london:  OHLC;
  newYork: OHLC;
}

export interface WeekOHLC extends OHLC {
  weekOf: string;    // Monday's date, YYYY-MM-DD
}

export interface PivotLevels {
  r3:    number;
  r2:    number;
  r1:    number;
  pivot: number;
  s1:    number;
  s2:    number;
  s3:    number;
}

export interface VWAPLevels {
  sdPlus3:  number;
  sdPlus2:  number;
  sdPlus1:  number;
  vwap:     number;
  sdMinus1: number;
  sdMinus2: number;
  sdMinus3: number;
}

export interface VolumeProfile {
  valueAreaHigh:  number;
  pointOfControl: number;
  valueAreaLow:   number;
}

export interface OpeningRange {
  high: number;
  low:  number;
}

export interface InstrumentIndicators {
  symbol:        string;
  pivots:        PivotLevels;
  prevDayOHLC:   DayOHLC[];      // 5 days, index 0 = most recent
  weeklyOHLC:    WeekOHLC[];     // 5 weeks, index 0 = most recent
  vwap:          VWAPLevels;
  volumeProfile: VolumeProfile;
  openingRange:  OpeningRange;
}