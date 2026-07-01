import { Injectable, signal } from '@angular/core';
import { INDICATORS, INDICATORS_MAP, LEVEL_VALUES } from '../../data/indicators.data';
import { InstrumentIndicators } from '../../shared/model/indicator.model';

export type { InstrumentIndicators, PivotLevels, VWAPLevels, VolumeProfile, OpeningRange, DayOHLC, WeekOHLC, OHLC } from '../../shared/model/indicator.model';

@Injectable({ providedIn: 'root' })
export class IndicatorService {
  private readonly _indicators = signal<InstrumentIndicators[]>(INDICATORS);

  readonly indicators  = this._indicators.asReadonly();
  readonly dayDates:  string[] = INDICATORS[0]?.prevDayOHLC.map(d => d.date)  ?? [];
  readonly weekDates: string[] = INDICATORS[0]?.weeklyOHLC.map(w => w.weekOf) ?? [];

  getBySymbol(symbol: string): InstrumentIndicators | undefined {
    return INDICATORS_MAP.get(symbol);
  }

  getLevelValue(symbol: string, levelId: string): number | undefined {
    return LEVEL_VALUES.get(symbol)?.[levelId];
  }

  getLevelValues(symbol: string): Record<string, number> | undefined {
    return LEVEL_VALUES.get(symbol);
  }
}