import { Injectable, inject, signal } from '@angular/core';
import { MarketApiService } from './market-api.service';

export type { FuturesContract, InstrumentCategory, InstrumentType } from '../../shared/model/instrument.model';

import { FuturesContract } from '../../shared/model/instrument.model';

@Injectable({ providedIn: 'root' })
export class InstrumentService {
  private readonly marketApi = inject(MarketApiService);

  private readonly _instruments = signal<FuturesContract[]>([]);

  readonly instruments = this._instruments.asReadonly();

  constructor() {
    this.marketApi.getInstruments().subscribe({
      next: fetched => this._instruments.update(list => [...list, ...fetched]),
      error: err => console.error('Failed to load instruments from MarketWatchAPI', err),
    });
  }

  getByCategories(categories: string[]): FuturesContract[] {
    if (!categories.length) return [];
    return this._instruments().filter(i => categories.includes(i.category));
  }

  applyPriceUpdates(updates: Map<string, Partial<FuturesContract>>): void {
    this._instruments.update(list =>
      list.map(i => {
        const patch = updates.get(i.symbol);
        return patch ? { ...i, ...patch } : i;
      })
    );
  }
}
