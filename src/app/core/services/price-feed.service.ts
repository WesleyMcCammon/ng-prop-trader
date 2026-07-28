import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { InstrumentService } from './instrument.service';
import { QuoteSocketService, BidAskQuote } from './quote-socket.service';
import { FuturesContract } from '../../shared/model/instrument.model';

@Injectable({ providedIn: 'root' })
export class PriceFeedService {
  private readonly instrumentService = inject(InstrumentService);
  private readonly quoteSocket = inject(QuoteSocketService);
  private subscription: Subscription | null = null;

  start(): void {
    this.quoteSocket.start();
    if (this.subscription) return;
    this.subscription = this.quoteSocket.quotes$.subscribe(quotes => this.applyQuotes(quotes));
  }

  stop(): void {
    this.quoteSocket.stop();
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  private applyQuotes(quotes: BidAskQuote[]): void {
    const bySymbol = new Map(this.instrumentService.instruments().map(i => [i.symbol, i]));
    const updates = new Map<string, Partial<FuturesContract>>();

    for (const quote of quotes) {
      const inst = bySymbol.get(quote.symbol);
      if (!inst) continue;

      const { open, high, low, tickSize } = inst;
      const newPrice      = this.snap((quote.bid + quote.ask) / 2, tickSize);
      const newChange      = parseFloat((newPrice - open).toPrecision(10));
      const newChangePct   = open !== 0 ? parseFloat(((newChange / open) * 100).toPrecision(6)) : 0;

      updates.set(quote.symbol, {
        bid:       quote.bid,
        ask:       quote.ask,
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
