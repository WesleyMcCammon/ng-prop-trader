import { Injectable, inject } from '@angular/core';
import { FuturesContract } from '../../shared/model/instrument.model';
import { InstrumentService } from './instrument.service';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private instrumentService = inject(InstrumentService);

  refresh(): void {
    const updates = new Map<string, Partial<FuturesContract>>();

    for (const instrument of this.instrumentService.instruments()) {
      const jitter = (Math.random() * 2 - 1) * instrument.tickSize * 3;
      const price  = parseFloat((instrument.price + jitter).toPrecision(8));
      const spread = (instrument.ask - instrument.bid);
      const bid    = parseFloat((price - spread / 2).toPrecision(8));
      const ask    = parseFloat((price + spread / 2).toPrecision(8));
      const change = parseFloat((price - instrument.open).toPrecision(6));
      const changePct = parseFloat(((change / instrument.open) * 100).toPrecision(4));

      updates.set(instrument.symbol, { price, bid, ask, change, changePct });
    }

    this.instrumentService.applyPriceUpdates(updates);
  }
}
