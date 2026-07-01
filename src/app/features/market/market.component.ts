import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { InstrumentService } from '../../core/services/instrument.service';
import { CategoryService } from '../../core/services/category.service';
import { PriceFeedService } from '../../core/services/price-feed.service';
import { FuturesContract, InstrumentCategory } from '../../shared/model/instrument.model';
import { InstrumentCardComponent } from '../../shared/components/instrument-card/instrument-card.component';
import { PinnedInstrumentsComponent } from './pinned-instruments/pinned-instruments.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [RouterLink, InstrumentCardComponent, PinnedInstrumentsComponent, DragDropModule],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss'
})
export class MarketComponent implements OnDestroy {
  private instrumentService = inject(InstrumentService);
  private categoryService   = inject(CategoryService);
  private priceFeed         = inject(PriceFeedService);

  instruments = this.instrumentService.instruments;

  readonly futuresCategories: InstrumentCategory[] = this.categoryService.byType('futures');
  readonly forexCategories:   InstrumentCategory[] = this.categoryService.byType('forex');

  viewMode    = signal<'categorized' | 'all'>('categorized');

  showFutures = signal(true);
  showForex   = signal(true);
  showCfds    = signal(true);
  showMicro   = signal(true);
  activeF     = signal<Set<InstrumentCategory>>(new Set(this.futuresCategories));
  activeFx    = signal<Set<InstrumentCategory>>(new Set(this.forexCategories));

  futures = computed(() => {
    const active = this.activeF();
    const micro  = this.showMicro();
    return this.instruments().filter(i =>
      i.type === 'futures' &&
      active.has(i.category) &&
      (micro || !i.name.startsWith('Micro'))
    );
  });

  forex = computed(() => {
    const active = this.activeFx();
    return this.instruments().filter(i => i.type === 'forex' && active.has(i.category));
  });

  cfds = computed(() => this.instruments().filter(i => i.type === 'cfd'));

  all = computed(() => this.instruments());

  private futuresOrder = signal<string[]>([]);
  private forexOrder   = signal<string[]>([]);
  private cfdsOrder    = signal<string[]>([]);
  private allOrder     = signal<string[]>([]);

  orderedFutures = computed(() => this.applyOrder(this.futures(), this.futuresOrder()));
  orderedForex   = computed(() => this.applyOrder(this.forex(),   this.forexOrder()));
  orderedCfds    = computed(() => this.applyOrder(this.cfds(),    this.cfdsOrder()));
  orderedAll     = computed(() => this.applyOrder(this.all(),     this.allOrder()));

  private applyOrder(items: FuturesContract[], order: string[]): FuturesContract[] {
    if (order.length === 0) return items;
    const map = new Map(items.map(i => [i.symbol, i]));
    const ordered = order.filter(s => map.has(s)).map(s => map.get(s)!);
    const rest = items.filter(i => !order.includes(i.symbol));
    return [...ordered, ...rest];
  }

  constructor() {
    inject(Title).setTitle('Market – MarketWatch');
    this.priceFeed.start();
  }

  ngOnDestroy(): void {
    this.priceFeed.stop();
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

  onFuturesDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedFutures()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.futuresOrder.set(items.map(i => i.symbol));
  }

  onForexDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedForex()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.forexOrder.set(items.map(i => i.symbol));
  }

  onCfdsDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedCfds()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.cfdsOrder.set(items.map(i => i.symbol));
  }

  onAllDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedAll()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.allOrder.set(items.map(i => i.symbol));
  }
}