import { Injectable, inject } from '@angular/core';
import { InstrumentService } from './instrument.service';
import { FuturesContract } from '../../shared/model/instrument.model';

@Injectable({ providedIn: 'root' })
export class PriceFeedService {
  private readonly instrumentService = inject(InstrumentService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(intervalMs = 800): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    const instruments = this.instrumentService.instruments();
    const updates = new Map<string, Partial<FuturesContract>>();

    for (const inst of instruments) {
      if (Math.random() > 0.55) continue;

      const { tickSize, bid, ask, open, high, low } = inst;
      const spread = ask - bid;
      const ticks = (Math.floor(Math.random() * 3) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const delta = ticks * tickSize;

      const newBid   = this.snap(Math.max(tickSize, bid + delta), tickSize);
      const newAsk   = this.snap(newBid + spread, tickSize);
      const newPrice = this.snap((newBid + newAsk) / 2, tickSize);
      const newChange    = parseFloat((newPrice - open).toPrecision(10));
      const newChangePct = parseFloat(((newChange / open) * 100).toPrecision(6));

      updates.set(inst.symbol, {
        bid:       newBid,
        ask:       newAsk,
        price:     newPrice,
        high:      Math.max(high, newPrice),
        low:       Math.min(low,  newPrice),
        change:    newChange,
        changePct: newChangePct,
      });
    }

    if (updates.size > 0) {
      this.instrumentService.applyPriceUpdates(updates);
    }
  }

  private snap(value: number, tick: number): number {
    return parseFloat((Math.round(value / tick) * tick).toPrecision(12));
  }
}