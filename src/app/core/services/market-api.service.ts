import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FuturesContract, InstrumentCategory } from '../../shared/model/instrument.model';
import { DayOHLC, InstrumentIndicators, OHLC, WeekOHLC } from '../../shared/model/indicator.model';
import {
  ApiCfdInstrument,
  ApiForexPair, ApiForexPairsResponse,
  ApiFuturesCategory, ApiFuturesContract, ApiFuturesContractsResponse,
  ApiInstrumentIndicators, ApiFuturesIndicatorsResponse, ApiOhlcBar,
} from '../../shared/model/market-api.model';

const FUTURES_CATEGORY_MAP: Record<ApiFuturesCategory, InstrumentCategory> = {
  Indices: 'Indices',
  Metals: 'Metals',
  Currencies: 'Currencies',
  InterestRates: 'Financials',
  Energy: 'Energies',
};

/** Neutral zero-baseline seed for the fields the backend doesn't provide (mock quote simulator takes it from here). */
function seedQuoteFields(tickSize: number, spreadTicks?: number) {
  const spread = tickSize * (spreadTicks ?? 1);
  const swing = tickSize * 4;
  return {
    price: 0, bid: -spread / 2, ask: spread / 2,
    change: 0, changePct: 0,
    high: swing, low: -swing, open: 0,
    volume: 50_000,
  };
}

function mapFuturesContract(c: ApiFuturesContract): FuturesContract {
  const tickSize = 10 ** -c.pricePrecision;
  return {
    symbol: `/${c.symbol}`,
    name: c.name,
    type: 'futures',
    category: FUTURES_CATEGORY_MAP[c.category],
    exchange: c.exchange,
    currency: 'USD',
    contractSize: 1,
    tickSize,
    tickValue: 1,
    ...seedQuoteFields(tickSize),
  };
}

function mapForexPair(p: ApiForexPair, group: 'major' | 'minor'): FuturesContract {
  const tickSize = 10 ** -p.pricePrecision;
  const spreadTicks = 10;
  return {
    symbol: p.symbol,
    name: p.symbol,
    type: 'forex',
    category: group === 'major' ? 'Forex Majors' : 'Forex Minors',
    exchange: 'OTC',
    currency: p.symbol.split('/')[1] ?? 'USD',
    contractSize: 1,
    tickSize,
    tickValue: 1,
    ...seedQuoteFields(tickSize, spreadTicks),
  };
}

function mapCfdInstrument(c: ApiCfdInstrument): FuturesContract {
  const tickSize = 10 ** -c.pricePrecision;
  const spreadTicks = 20;
  return {
    symbol: c.symbol,
    name: c.name,
    type: 'cfd',
    category: 'CFDs',
    exchange: 'OTC',
    currency: 'USD',
    contractSize: 1,
    tickSize,
    tickValue: 1,
    ...seedQuoteFields(tickSize, spreadTicks),
  };
}

function mapOhlcBar(bar: ApiOhlcBar): WeekOHLC {
  return { weekOf: bar.periodStart, open: bar.open, high: bar.high, low: bar.low, close: bar.close };
}

function mapOhlc(bar: ApiOhlcBar): OHLC {
  return { open: bar.open, high: bar.high, low: bar.low, close: bar.close };
}

function mapPrevDayOHLC(ind: ApiInstrumentIndicators): DayOHLC[] {
  return ind.dailyOhlc.map((day, i) => ({
    date: day.periodStart,
    asia: mapOhlc(ind.asiaSessionOhlc[i]),
    london: mapOhlc(ind.londonSessionOhlc[i]),
    newYork: mapOhlc(ind.newYorkSessionOhlc[i]),
  }));
}

function mapIndicators(ind: ApiInstrumentIndicators, symbol: string): InstrumentIndicators {
  return {
    symbol,
    pivots: {
      r3: ind.pivots.r3, r2: ind.pivots.r2, r1: ind.pivots.r1,
      pivot: ind.pivots.pp,
      s1: ind.pivots.s1, s2: ind.pivots.s2, s3: ind.pivots.s3,
    },
    weeklyOHLC: ind.weeklyOhlc.map(mapOhlcBar),
    prevDayOHLC: mapPrevDayOHLC(ind),
    vwap: {
      sdPlus3: ind.vwap.stdDevPlus3, sdPlus2: ind.vwap.stdDevPlus2, sdPlus1: ind.vwap.stdDevPlus1,
      vwap: ind.vwap.vwap,
      sdMinus1: ind.vwap.stdDevMinus1, sdMinus2: ind.vwap.stdDevMinus2, sdMinus3: ind.vwap.stdDevMinus3,
    },
    volumeProfile: {
      valueAreaHigh: ind.volumeProfile.valueAreaHigh,
      pointOfControl: ind.volumeProfile.pointOfControl,
      valueAreaLow: ind.volumeProfile.valueAreaLow,
    },
    // openingRange intentionally omitted — the backend still has no opening-range data.
  };
}

@Injectable({ providedIn: 'root' })
export class MarketApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.marketApiUrl;

  /** Futures contracts + forex pairs + CFDs from the backend, mapped into the app's FuturesContract shape. */
  getInstruments(): Observable<FuturesContract[]> {
    return forkJoin({
      forex: this.http.get<ApiForexPairsResponse>(`${this.base}/ForexPairs`),
      futures: this.http.get<ApiFuturesContractsResponse>(`${this.base}/FuturesContracts`),
      cfds: this.http.get<ApiCfdInstrument[]>(`${this.base}/Cfds`),
    }).pipe(
      map(({ forex, futures, cfds }) => [
        ...forex.major.map(p => mapForexPair(p, 'major')),
        ...forex.minor.map(p => mapForexPair(p, 'minor')),
        ...futures.indices.map(mapFuturesContract),
        ...futures.metals.map(mapFuturesContract),
        ...futures.currencies.map(mapFuturesContract),
        ...futures.interestRates.map(mapFuturesContract),
        ...futures.energy.map(mapFuturesContract),
        ...cfds.map(mapCfdInstrument),
      ])
    );
  }

  /** Forex + futures + CFD indicator levels from the backend, mapped into the app's InstrumentIndicators shape. */
  getIndicators(): Observable<InstrumentIndicators[]> {
    return forkJoin({
      forex: this.http.get<ApiInstrumentIndicators[]>(`${this.base}/ForexIndicators`),
      futures: this.http.get<ApiFuturesIndicatorsResponse>(`${this.base}/FuturesIndicators`),
      cfds: this.http.get<ApiInstrumentIndicators[]>(`${this.base}/CfdIndicators`),
    }).pipe(
      map(({ forex, futures, cfds }) => [
        ...forex.map(ind => mapIndicators(ind, ind.symbol)),
        ...futures.indices.map(ind => mapIndicators(ind, `/${ind.symbol}`)),
        ...futures.metals.map(ind => mapIndicators(ind, `/${ind.symbol}`)),
        ...futures.currencies.map(ind => mapIndicators(ind, `/${ind.symbol}`)),
        ...futures.interestRates.map(ind => mapIndicators(ind, `/${ind.symbol}`)),
        ...futures.energy.map(ind => mapIndicators(ind, `/${ind.symbol}`)),
        ...cfds.map(ind => mapIndicators(ind, ind.symbol)),
      ])
    );
  }
}
