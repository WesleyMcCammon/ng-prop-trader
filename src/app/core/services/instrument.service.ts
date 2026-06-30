import { Injectable, signal } from '@angular/core';
import { INSTRUMENTS } from '../../data/instruments.data';

export type { FuturesContract, InstrumentCategory, InstrumentType } from '../../shared/model/instrument.model';

import { FuturesContract } from '../../shared/model/instrument.model';

@Injectable({ providedIn: 'root' })
export class InstrumentService {
  private readonly _instruments = signal<FuturesContract[]>([...INSTRUMENTS]);

  readonly instruments = this._instruments.asReadonly();

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
