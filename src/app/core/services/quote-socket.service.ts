import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InstrumentService } from './instrument.service';
import { ApiQuote } from '../../shared/model/market-api.model';

export interface BidAskQuote {
  symbol: string;
  bid: number;
  ask: number;
}

const RECONNECT_DELAY_MS = 2000;

/** Streams real bid/ask ticks for every instrument from the MarketWatchAPI /ws/quotes websocket. */
@Injectable({ providedIn: 'root' })
export class QuoteSocketService {
  private readonly instrumentService = inject(InstrumentService);

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;

  private readonly _quotes$ = new Subject<BidAskQuote[]>();
  readonly quotes$: Observable<BidAskQuote[]> = this._quotes$.asObservable();

  start(): void {
    if (this.socket) return;
    this.stopped = false;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  private connect(): void {
    const url = `${environment.marketApiUrl.replace(/^http/, 'ws')}/ws/quotes`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onmessage = event => {
      const quote = this.parseQuote(event.data);
      if (quote) this._quotes$.next([quote]);
    };

    socket.onclose = () => this.scheduleReconnect();
    socket.onerror = () => socket.close();
  }

  private scheduleReconnect(): void {
    this.socket = null;
    if (this.stopped || this.reconnectTimer !== null) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.stopped) this.connect();
    }, RECONNECT_DELAY_MS);
  }

  /** Backend futures symbols arrive bare (e.g. "ES"); the app uses a "/"-prefixed convention for them. */
  private resolveSymbol(rawSymbol: string): string | undefined {
    const instruments = this.instrumentService.instruments();
    if (instruments.some(i => i.symbol === rawSymbol)) return rawSymbol;
    const prefixed = `/${rawSymbol}`;
    if (instruments.some(i => i.symbol === prefixed)) return prefixed;
    return undefined;
  }

  private parseQuote(data: string): BidAskQuote | null {
    try {
      const raw = JSON.parse(data) as ApiQuote;
      const symbol = this.resolveSymbol(raw.Symbol);
      if (!symbol) return null;
      return { symbol, bid: raw.Bid, ask: raw.Ask };
    } catch {
      return null;
    }
  }
}
