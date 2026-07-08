import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { LEVEL_VALUES } from '../../data/indicators.data';

export interface LevelValuesUpdate {
  symbol: string;
  values: Record<string, number>;
}

/** Broadcasts mocked indicator level values (pivots, VWAP, etc.) per instrument. */
@Injectable({ providedIn: 'root' })
export class IndicatorLevelFeedService {
  private readonly _levelValues$ = new ReplaySubject<LevelValuesUpdate[]>(1);
  readonly levelValues$: Observable<LevelValuesUpdate[]> = this._levelValues$.asObservable();

  constructor() {
    this.broadcast();
  }

  /** Broadcasts the current mocked level values for every instrument. */
  broadcast(): void {
    const updates: LevelValuesUpdate[] = [];
    LEVEL_VALUES.forEach((values, symbol) => updates.push({ symbol, values }));
    this._levelValues$.next(updates);
  }
}
