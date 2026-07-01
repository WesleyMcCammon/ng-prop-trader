import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PinService {
  readonly pinnedSymbols = signal<Set<string>>(new Set());
  readonly count = computed(() => this.pinnedSymbols().size);

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