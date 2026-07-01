import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InstrumentService } from '../../../core/services/instrument.service';
import { CategoryService } from '../../../core/services/category.service';
import { InstrumentCategory } from '../../../shared/model/instrument.model';

type SortDir = 'asc' | 'desc';

export const TOGGLEABLE_COLS = [
  { key: 'price',     label: 'Price'    },
  { key: 'bid',       label: 'Bid'      },
  { key: 'ask',       label: 'Ask'      },
  { key: 'change',    label: 'Change'   },
  { key: 'changePct', label: 'Change %' },
  { key: 'high',      label: 'High'     },
  { key: 'low',       label: 'Low'      },
  { key: 'volume',    label: 'Volume'   },
] as const;

@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './instruments.component.html',
  styleUrl: './instruments.component.scss'
})
export class InstrumentsComponent implements OnInit {
  private instrumentService = inject(InstrumentService);
  private categoryService   = inject(CategoryService);

  @Input() showAll = false;

  instruments = this.instrumentService.instruments;
  sortDir     = signal<SortDir>('asc');
  visibleCols = signal<Set<string>>(new Set());
  activeSymbols = signal<Set<string>>(new Set());

  readonly toggleableCols = TOGGLEABLE_COLS;
  readonly futuresCategories: InstrumentCategory[] = this.categoryService.byType('futures');
  readonly forexCategories:   InstrumentCategory[] = this.categoryService.byType('forex');

  activeF    = signal<Set<InstrumentCategory>>(new Set(this.futuresCategories));
  activeFx   = signal<Set<InstrumentCategory>>(new Set(this.forexCategories));
  showMicro  = signal<boolean>(true);

  private sorted = computed(() => {
    const dir = this.sortDir();
    return [...this.instruments()].sort((a, b) =>
      dir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol)
    );
  });

  futuresInstruments = computed(() => {
    const active = this.activeF();
    const micro  = this.showMicro();
    return this.sorted().filter(i =>
      i.type === 'futures' &&
      active.has(i.category) &&
      (micro || !i.name.startsWith('Micro'))
    );
  });

  forexInstruments = computed(() => {
    const active = this.activeFx();
    return this.sorted().filter(i => i.type === 'forex' && active.has(i.category));
  });

  cfdInstruments = computed(() => this.sorted().filter(i => i.type === 'cfd'));

  constructor() {
    inject(Title).setTitle('Instruments – MarketWatch');
  }

  ngOnInit(): void {
    const allKeys = this.toggleableCols.map(c => c.key);
    this.visibleCols.set(new Set(this.showAll ? allKeys : []));
  }

  col(key: string): boolean {
    return this.visibleCols().has(key);
  }

  toggleCol(key: string): void {
    this.visibleCols.update(set => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  expandedRows = signal<Set<string>>(new Set());

  isActive(symbol: string): boolean {
    return this.activeSymbols().has(symbol);
  }

  isExpanded(symbol: string): boolean {
    return this.expandedRows().has(symbol);
  }

  toggleActive(symbol: string): void {
    this.activeSymbols.update(set => {
      const next = new Set(set);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  toggleRow(symbol: string): void {
    this.expandedRows.update(set => {
      const next = new Set(set);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  isSectionExpanded(instruments: { symbol: string }[]): boolean {
    const expanded = this.expandedRows();
    return instruments.length > 0 && instruments.every(i => expanded.has(i.symbol));
  }

  toggleSection(instruments: { symbol: string }[]): void {
    const expand = !this.isSectionExpanded(instruments);
    this.expandedRows.update(set => {
      const next = new Set(set);
      instruments.forEach(i => expand ? next.add(i.symbol) : next.delete(i.symbol));
      return next;
    });
  }

  toggleSort(): void {
    this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
  }

  toggleFutures(cat: InstrumentCategory): void {
    this.activeF.update(set => {
      const next = new Set(set);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  toggleForex(cat: InstrumentCategory): void {
    this.activeFx.update(set => {
      const next = new Set(set);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }
}