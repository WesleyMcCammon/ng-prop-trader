import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { InstrumentService } from './instrument.service';

export interface BidAskQuote {
  symbol: string;
  bid: number;
  ask: number;
}

/** Generates and broadcasts mocked bid/ask ticks for every instrument. */
@Injectable({ providedIn: 'root' })
export class QuoteFeedService {
  private readonly instrumentService = inject(InstrumentService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly _quotes$ = new Subject<BidAskQuote[]>();
  readonly quotes$: Observable<BidAskQuote[]> = this._quotes$.asObservable();

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
    const quotes: BidAskQuote[] = [];

    for (const inst of this.instrumentService.instruments()) {
      if (Math.random() > 0.55) continue;

      const { tickSize, bid, ask } = inst;
      const spread = ask - bid;
      const ticks = (Math.floor(Math.random() * 3) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const delta = ticks * tickSize;

      const newBid = this.snap(Math.max(tickSize, bid + delta), tickSize);
      const newAsk = this.snap(newBid + spread, tickSize);

      quotes.push({ symbol: inst.symbol, bid: newBid, ask: newAsk });
    }

    if (quotes.length > 0) {
      this._quotes$.next(quotes);
    }
  }

  private snap(value: number, tick: number): number {
    return parseFloat((Math.round(value / tick) * tick).toPrecision(12));
  }
}
