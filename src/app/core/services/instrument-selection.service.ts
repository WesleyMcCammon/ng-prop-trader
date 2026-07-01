import { Injectable, computed, effect, signal } from '@angular/core';

const STORAGE_KEY = 'mw.activeInstruments';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

@Injectable({ providedIn: 'root' })
export class InstrumentSelectionService {
  readonly activeSymbols = signal<Set<string>>(load());
  readonly count         = computed(() => this.activeSymbols().size);
  readonly hasSelection  = computed(() => this.activeSymbols().size > 0);

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.activeSymbols()])));
  }

  isActive(symbol: string): boolean {
    return this.activeSymbols().has(symbol);
  }

  toggle(symbol: string): void {
    this.activeSymbols.update(set => {
      const next = new Set(set);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }
}