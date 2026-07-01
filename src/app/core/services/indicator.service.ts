import { Injectable, signal } from '@angular/core';
import { INDICATORS, INDICATORS_MAP } from '../../data/indicators.data';
import { InstrumentIndicators } from '../../shared/model/indicator.model';

export type { InstrumentIndicators, PivotLevels, VWAPLevels, VolumeProfile, OpeningRange, DayOHLC, WeekOHLC, OHLC } from '../../shared/model/indicator.model';

@Injectable({ providedIn: 'root' })
export class IndicatorService {
  private readonly _indicators = signal<InstrumentIndicators[]>(INDICATORS);

  readonly indicators = this._indicators.asReadonly();

  getBySymbol(symbol: string): InstrumentIndicators | undefined {
    return INDICATORS_MAP.get(symbol);
  }
}