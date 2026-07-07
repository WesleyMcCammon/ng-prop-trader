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

const SECTION_DEFS: Array<{ key: Section; label: string }> = [
  { key: 'futures', label: 'Futures' },
  { key: 'forex',   label: 'Forex' },
  { key: 'cfd',     label: 'CFD' },
];

const CATEGORY_ORDER: Record<Section, string[]> = {
  futures: ['Indices', 'Metals', 'Energies', 'Financials', 'Currencies'],
  forex:   ['Forex Majors', 'Forex Minors'],
  cfd:     [],
};

interface CategoryGroup {
  category: string;
  items: FuturesContract[];
}

const CURRENCY_FLAGS: Record<string, string> = {
  EUR: 'eu',
  USD: 'us',
  GBP: 'gb',
  JPY: 'jp',
  CHF: 'ch',
  CAD: 'ca',
  AUD: 'au',
  NZD: 'nz',
};

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

  // ── Category groups (per section) ──────────────────────
  collapsedFuturesGroups = signal<Set<string>>(new Set());
  collapsedForexGroups   = signal<Set<string>>(new Set());
  collapsedCfdGroups     = signal<Set<string>>(new Set());

  futuresGroups = computed<CategoryGroup[]>(() => this.buildGroups(this.futuresInstruments(), 'futures'));
  forexGroups   = computed<CategoryGroup[]>(() => this.buildGroups(this.forexInstruments(),   'forex'));
  cfdGroups     = computed<CategoryGroup[]>(() => this.buildGroups(this.cfdInstruments(),     'cfd'));

  private buildGroups(items: FuturesContract[], section: Section): CategoryGroup[] {
    const order = CATEGORY_ORDER[section];
    const groups = new Map<string, FuturesContract[]>();
    for (const i of items) {
      const arr = groups.get(i.category) ?? [];
      arr.push(i);
      groups.set(i.category, arr);
    }
    const keys = [...groups.keys()].sort((a, b) => {
      const ao = order.indexOf(a);
      const bo = order.indexOf(b);
      if (ao !== -1 && bo !== -1) return ao - bo;
      if (ao !== -1) return -1;
      if (bo !== -1) return 1;
      return a.localeCompare(b);
    });
    return keys.map(category => ({ category, items: groups.get(category)! }));
  }

  // ── Section list + selection summary ──────────────────
  readonly sectionDefs = SECTION_DEFS;
  selectedType = signal<Section>('futures');

  activeSummary = computed(() => {
    const active = this.selectionService.activeSymbols();
    if (active.size === 0) return [];
    return SECTION_DEFS
      .map(s => ({ section: s, symbols: this.baseFor(s.key).filter(i => active.has(i.symbol)).map(i => i.symbol) }))
      .filter(entry => entry.symbols.length > 0);
  });

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

  pairFlags(symbol: string): string[] {
    return symbol.split('/').map(code => CURRENCY_FLAGS[code]).filter((code): code is string => !!code);
  }

  uniqueVals(items: FuturesContract[], col: string): string[] {
    return [...new Set(items.map(i => this.fieldVal(i, col)))].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }

  private fieldVal(i: FuturesContract, col: string): string {
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

  private baseFor(type: Section): FuturesContract[] {
    return type === 'futures' ? this.futuresBase() :
           type === 'forex'   ? this.forexBase()   : this.cfdBase();
  }

  // ── Section selection (list box) ───────────────────────

  selectType(type: Section): void {
    this.selectedType.set(type);
  }

  isTypeSelected(type: Section): boolean {
    return this.selectedType() === type;
  }

  baseCountByType(type: Section): number {
    return this.baseFor(type).length;
  }

  activeCountByType(type: Section): number {
    const active = this.selectionService.activeSymbols();
    return this.baseFor(type).filter(i => active.has(i.symbol)).length;
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

  private getCollapsedGroupsSig(section: Section): WritableSignal<Set<string>> {
    return section === 'futures' ? this.collapsedFuturesGroups :
           section === 'forex'   ? this.collapsedForexGroups   : this.collapsedCfdGroups;
  }

  private groupsFor(section: Section): CategoryGroup[] {
    return section === 'futures' ? this.futuresGroups() :
           section === 'forex'   ? this.forexGroups()   : this.cfdGroups();
  }

  isGroupExpanded(section: Section, category: string): boolean {
    return !this.getCollapsedGroupsSig(section)().has(category);
  }

  toggleGroup(section: Section, category: string): void {
    this.getCollapsedGroupsSig(section).update(set => {
      const next = new Set(set);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }

  isAllGroupsExpanded(section: Section): boolean {
    return this.getCollapsedGroupsSig(section)().size === 0;
  }

  toggleAllGroups(section: Section): void {
    const sig = this.getCollapsedGroupsSig(section);
    sig.set(
      this.isAllGroupsExpanded(section)
        ? new Set(this.groupsFor(section).map(g => g.category))
        : new Set()
    );
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
