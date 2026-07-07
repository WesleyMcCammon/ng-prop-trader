import { Component, HostListener, Input, OnDestroy, OnInit, WritableSignal, effect, inject, signal, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { InstrumentService } from '../../core/services/instrument.service';
import { PriceFeedService } from '../../core/services/price-feed.service';
import { InstrumentSelectionService } from '../../core/services/instrument-selection.service';
import { FuturesContract } from '../../shared/model/instrument.model';
import { PriceFormatPipe } from '../../shared/pipes/price-format.pipe';
import { AdSidebarComponent } from '../../shared/components/ad-sidebar/ad-sidebar.component';
import { MockAd } from '../../shared/model/ad.model';

const INSTRUMENT_ADS: MockAd[] = [
  {
    sponsor: 'AMP Futures',
    headline: 'Low Day-Trading Margins',
    body: 'Trade futures with some of the lowest intraday margin requirements in the industry.',
    cta: 'Open Account'
  },
  {
    sponsor: 'Tradovate',
    headline: 'Commission-Free Futures',
    body: 'Flat-rate monthly plans with no per-contract fees on every trade.',
    cta: 'Learn More'
  },
  {
    sponsor: 'NinjaTrader Brokerage',
    headline: 'Trade Smarter, Not Harder',
    body: 'Award-winning platform with deep discounts on futures commissions.',
    cta: 'Get Started'
  }
];

type SortDir    = 'asc' | 'desc';
type Section    = 'futures' | 'forex' | 'cfd';
type ColFilters = Record<string, Set<string>>;

const STORAGE_FILTERS: Record<Section, string> = {
  futures: 'mw.filters.futures',
  forex:   'mw.filters.forex',
  cfd:     'mw.filters.cfd',
};

function loadFilters(key: string): ColFilters {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed: Record<string, string[]> = JSON.parse(raw);
    return Object.fromEntries(Object.entries(parsed).map(([k, arr]) => [k, new Set(arr)]));
  } catch { return {}; }
}

function saveFilters(key: string, f: ColFilters): void {
  localStorage.setItem(key, JSON.stringify(
    Object.fromEntries(Object.entries(f).map(([k, s]) => [k, [...s]]))
  ));
}

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
  imports: [CommonModule, PriceFormatPipe, AdSidebarComponent],
  templateUrl: './instruments.component.html',
  styleUrl: './instruments.component.scss'
})
export class InstrumentsComponent implements OnInit, OnDestroy {
  private instrumentService = inject(InstrumentService);
  private priceFeed         = inject(PriceFeedService);
  private selectionService  = inject(InstrumentSelectionService);

  @Input() showAll = false;

  readonly ads = INSTRUMENT_ADS;

  instruments = this.instrumentService.instruments;
  sortDir     = signal<SortDir>('asc');
  visibleCols = signal<Set<string>>(new Set());

  readonly toggleableCols = TOGGLEABLE_COLS;

  // Column filter state per section — persisted to localStorage
  futuresColFilters = signal<ColFilters>(loadFilters(STORAGE_FILTERS.futures));
  forexColFilters   = signal<ColFilters>(loadFilters(STORAGE_FILTERS.forex));
  cfdColFilters     = signal<ColFilters>(loadFilters(STORAGE_FILTERS.cfd));
  openFilter        = signal<{ key: string; x: number; y: number } | null>(null);

  private sorted = computed(() => {
    const dir = this.sortDir();
    return [...this.instruments()].sort((a, b) =>
      dir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol)
    );
  });

  private activeFilter = computed(() => {
    if (!this.showAll) return null;
    const s = this.selectionService.activeSymbols();
    return s.size > 0 ? s : null;
  });

  // Base arrays: selection filtered, before column filters
  readonly futuresBase = computed(() => {
    const sel = this.activeFilter();
    return this.sorted().filter(i => i.type === 'futures' && (!sel || sel.has(i.symbol)));
  });

  readonly forexBase = computed(() => {
    const sel = this.activeFilter();
    return this.sorted().filter(i => i.type === 'forex' && (!sel || sel.has(i.symbol)));
  });

  readonly cfdBase = computed(() => {
    const sel = this.activeFilter();
    return this.sorted().filter(i => i.type === 'cfd' && (!sel || sel.has(i.symbol)));
  });

  // Final arrays: base + column filters applied
  futuresInstruments = computed(() => this.applyColFilters(this.futuresBase(), this.futuresColFilters()));
  forexInstruments   = computed(() => this.applyColFilters(this.forexBase(),   this.forexColFilters()));
  cfdInstruments     = computed(() => this.applyColFilters(this.cfdBase(),     this.cfdColFilters()));

  constructor() {
    inject(Title).setTitle('Instruments – MarketWatch');
    effect(() => saveFilters(STORAGE_FILTERS.futures, this.futuresColFilters()));
    effect(() => saveFilters(STORAGE_FILTERS.forex,   this.forexColFilters()));
    effect(() => saveFilters(STORAGE_FILTERS.cfd,     this.cfdColFilters()));
  }

  ngOnInit(): void {
    const allKeys = this.toggleableCols.map(c => c.key);
    this.visibleCols.set(new Set(this.showAll ? allKeys : []));
    this.priceFeed.start();
  }

  ngOnDestroy(): void {
    this.priceFeed.stop();
  }

  @HostListener('document:click')
  closeFilters(): void {
    this.openFilter.set(null);
  }

  // ── Column filter ─────────────────────────────────────

  isFilterOpen(section: Section, col: string): boolean {
    return this.openFilter()?.key === `${section}:${col}`;
  }

  toggleFilterOpen(section: Section, col: string, event: Event): void {
    event.stopPropagation();
    const key = `${section}:${col}`;
    if (this.openFilter()?.key === key) {
      this.openFilter.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.openFilter.set({ key, x: rect.left, y: rect.bottom + 4 });
  }

  colFilterCount(filters: ColFilters, col: string): number {
    return filters[col]?.size ?? 0;
  }

  colFilterActive(filters: ColFilters, col: string): boolean {
    return (filters[col]?.size ?? 0) > 0;
  }

  isFilterChecked(filters: ColFilters, col: string, val: string): boolean {
    return filters[col]?.has(val) ?? false;
  }

  toggleColFilter(section: Section, col: string, val: string, event: Event): void {
    event.stopPropagation();
    this.getFilterSig(section).update(f => {
      const next = { ...f };
      const set = new Set(next[col] ?? []);
      set.has(val) ? set.delete(val) : set.add(val);
      if (set.size === 0) delete next[col];
      else next[col] = set;
      return next;
    });
  }

  clearColFilter(section: Section, col: string, event: Event): void {
    event.stopPropagation();
    this.getFilterSig(section).update(f => {
      const next = { ...f };
      delete next[col];
      return next;
    });
  }

  instrumentSize(i: FuturesContract): string {
    if (i.name.startsWith('Micro')) return 'Micro';
    if (i.name.startsWith('E-mini')) return 'E-mini';
    return 'Standard';
  }

  uniqueVals(items: FuturesContract[], col: string): string[] {
    return [...new Set(items.map(i => this.fieldVal(i, col)))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }

  private fieldVal(i: FuturesContract, col: string): string {
    if (col === 'size') return this.instrumentSize(i);
    return String((i as any)[col]);
  }

  private applyColFilters(items: FuturesContract[], filters: ColFilters): FuturesContract[] {
    const entries = Object.entries(filters).filter(([, s]) => s.size > 0);
    if (!entries.length) return items;
    return items.filter(i => entries.every(([col, vals]) => vals.has(this.fieldVal(i, col))));
  }

  private getFilterSig(section: Section): WritableSignal<ColFilters> {
    return section === 'futures' ? this.futuresColFilters :
           section === 'forex'   ? this.forexColFilters   : this.cfdColFilters;
  }

  // ── Table row state ───────────────────────────────────

  expandedRows = signal<Set<string>>(new Set());

  isActive(symbol: string): boolean {
    return this.selectionService.isActive(symbol);
  }

  isExpanded(symbol: string): boolean {
    return this.expandedRows().has(symbol);
  }

  toggleActive(symbol: string): void {
    this.selectionService.toggle(symbol);
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

}
