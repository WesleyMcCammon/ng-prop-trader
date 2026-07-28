import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { InstrumentIndicators } from '../../shared/model/indicator.model';
import { MarketApiService } from './market-api.service';

export interface LevelValuesUpdate {
  symbol: string;
  values: Record<string, number>;
}

/** Maps InstrumentIndicators to a flat Record keyed by the level IDs defined in the
 *  indicators component (e.g. 'pivots.r3', 'vwap.sd3', 'pd.asia.open'). Prev Day and
 *  Opening Range are omitted when absent — the backend doesn't provide session/opening-range
 *  data for forex/futures/CFD instruments. */
function flattenLevelValues(ind: InstrumentIndicators): Record<string, number> {
  const week = ind.weeklyOHLC[0];
  const values: Record<string, number> = {
    'pivots.r3':    ind.pivots.r3,
    'pivots.r2':    ind.pivots.r2,
    'pivots.r1':    ind.pivots.r1,
    'pivots.pivot': ind.pivots.pivot,
    'pivots.s1':    ind.pivots.s1,
    'pivots.s2':    ind.pivots.s2,
    'pivots.s3':    ind.pivots.s3,

    'vwap.sd3':  ind.vwap.sdPlus3,
    'vwap.sd2':  ind.vwap.sdPlus2,
    'vwap.sd1':  ind.vwap.sdPlus1,
    'vwap.vwap': ind.vwap.vwap,
    'vwap.sm1':  ind.vwap.sdMinus1,
    'vwap.sm2':  ind.vwap.sdMinus2,
    'vwap.sm3':  ind.vwap.sdMinus3,

    'vp.vah': ind.volumeProfile.valueAreaHigh,
    'vp.poc': ind.volumeProfile.pointOfControl,
    'vp.val': ind.volumeProfile.valueAreaLow,

    'wk.open':  week.open,
    'wk.high':  week.high,
    'wk.low':   week.low,
    'wk.close': week.close,
  };

  if (ind.openingRange) {
    values['or.high'] = ind.openingRange.high;
    values['or.low']  = ind.openingRange.low;
  }

  const day = ind.prevDayOHLC?.[0];
  if (day) {
    values['pd.asia.open']  = day.asia.open;
    values['pd.asia.high']  = day.asia.high;
    values['pd.asia.low']   = day.asia.low;
    values['pd.asia.close'] = day.asia.close;
    values['pd.lon.open']   = day.london.open;
    values['pd.lon.high']   = day.london.high;
    values['pd.lon.low']    = day.london.low;
    values['pd.lon.close']  = day.london.close;
    values['pd.ny.open']    = day.newYork.open;
    values['pd.ny.high']    = day.newYork.high;
    values['pd.ny.low']     = day.newYork.low;
    values['pd.ny.close']   = day.newYork.close;
  }

  return values;
}

/** Broadcasts indicator level values (pivots, VWAP, etc.) per instrument, sourced from the backend. */
@Injectable({ providedIn: 'root' })
export class IndicatorLevelFeedService {
  private readonly marketApi = inject(MarketApiService);

  private readonly _levelValues$ = new ReplaySubject<LevelValuesUpdate[]>(1);
  readonly levelValues$: Observable<LevelValuesUpdate[]> = this._levelValues$.asObservable();

  private readonly values = new Map<string, Record<string, number>>();

  constructor() {
    this.marketApi.getIndicators().subscribe({
      next: fetched => {
        fetched.forEach(ind => this.values.set(ind.symbol, flattenLevelValues(ind)));
        this.broadcast();
      },
      error: err => console.error('Failed to load indicator levels from MarketWatchAPI', err),
    });
  }

  /** Broadcasts the current level values for every instrument. */
  broadcast(): void {
    const updates: LevelValuesUpdate[] = [];
    this.values.forEach((values, symbol) => updates.push({ symbol, values }));
    this._levelValues$.next(updates);
  }
}
