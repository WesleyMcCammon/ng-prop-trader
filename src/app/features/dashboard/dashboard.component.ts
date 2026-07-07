import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { InstrumentService } from '../../core/services/instrument.service';
import { PriceFeedService } from '../../core/services/price-feed.service';
import { IndicatorService, ActiveLevelDisplay } from '../../core/services/indicator.service';
import { InstrumentSelectionService } from '../../core/services/instrument-selection.service';
import { PriceFormatPipe } from '../../shared/pipes/price-format.pipe';

type SortDir = 'asc' | 'desc';

interface DashboardRow {
  symbol: string;
  type: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  tickSize: number;
  levels: ActiveLevelDisplay[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PriceFormatPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private instrumentService = inject(InstrumentService);
  private priceFeed         = inject(PriceFeedService);
  private indicatorService  = inject(IndicatorService);
  private selectionService  = inject(InstrumentSelectionService);

  sortDir          = signal<SortDir>('asc');
  showSelectedOnly = signal(false);

  rows = computed<DashboardRow[]>(() => {
    const dir = this.sortDir();
    const onlySelected = this.showSelectedOnly();
    const active = this.selectionService.activeSymbols();
    const sorted = [...this.instrumentService.instruments()]
      .filter(i => !onlySelected || active.has(i.symbol))
      .sort((a, b) =>
        dir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol)
      );
    return sorted.map(i => ({
      symbol: i.symbol,
      type: i.type,
      name: i.name,
      bid: i.bid,
      ask: i.ask,
      change: i.change,
      tickSize: i.tickSize,
      levels: this.indicatorService.getActiveLevelsForInstrument(i.symbol, i.bid).slice(0, 5),
    }));
  });

  constructor() {
    inject(Title).setTitle('Dashboard – MarketWatch');
  }

  ngOnInit(): void {
    this.priceFeed.start();
  }

  ngOnDestroy(): void {
    this.priceFeed.stop();
  }

  toggleSort(): void {
    this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
  }

  toggleShowSelectedOnly(): void {
    this.showSelectedOnly.update(v => !v);
  }
}
