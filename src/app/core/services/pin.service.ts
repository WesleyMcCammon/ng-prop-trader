import { Injectable, computed, effect, signal } from '@angular/core';

const STORAGE_PINS = 'mw.pinnedSymbols';

function loadPins(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_PINS);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

@Injectable({ providedIn: 'root' })
export class PinService {
  readonly pinnedSymbols = signal<Set<string>>(loadPins());
  readonly count = computed(() => this.pinnedSymbols().size);

  constructor() {
    effect(() => localStorage.setItem(STORAGE_PINS, JSON.stringify([...this.pinnedSymbols()])));
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
}