import { Injectable, computed, effect, signal } from '@angular/core';

const STORAGE_PINS  = 'mw.pinnedSymbols';
const STORAGE_ORDER = 'mw.pinnedOrder';

function loadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_PINS);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function loadOrder(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDER);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class PinService {
  readonly pinnedSymbols = signal<Set<string>>(loadSet());
  readonly pinnedOrder   = signal<string[]>(loadOrder());
  readonly count         = computed(() => this.pinnedSymbols().size);

  // Animation coordination: set in InstrumentCardComponent before toggling a pin;
  // PinnedInstrumentsComponent reads these to FLIP-animate the entering card.
  readonly justPinned = signal<{ symbol: string; id: number } | null>(null);
  pendingSourceRect: DOMRect | null = null;

  constructor() {
    effect(() => localStorage.setItem(STORAGE_PINS,  JSON.stringify([...this.pinnedSymbols()])));
    effect(() => localStorage.setItem(STORAGE_ORDER, JSON.stringify(this.pinnedOrder())));
  }

  isPinned(symbol: string): boolean {
    return this.pinnedSymbols().has(symbol);
  }

  toggle(symbol: string): void {
    this.pinnedSymbols.update(set => {
      const next = new Set(set);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  applyOrder<T extends { symbol: string }>(items: T[]): T[] {
    const order = this.pinnedOrder();
    if (order.length === 0) return items;
    const map = new Map(items.map(i => [i.symbol, i]));
    const ordered = order.filter(s => map.has(s)).map(s => map.get(s)!);
    const rest = items.filter(i => !order.includes(i.symbol));
    return [...ordered, ...rest];
  }
}