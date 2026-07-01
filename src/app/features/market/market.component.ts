import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { InstrumentService } from '../../core/services/instrument.service';
import { CategoryService } from '../../core/services/category.service';
import { InstrumentCategory } from '../../shared/model/instrument.model';
import { InstrumentCardComponent } from '../../shared/components/instrument-card/instrument-card.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [RouterLink, InstrumentCardComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss'
})
export class MarketComponent {
  private instrumentService = inject(InstrumentService);
  private categoryService   = inject(CategoryService);

  instruments = this.instrumentService.instruments;

  readonly futuresCategories: InstrumentCategory[] = this.categoryService.byType('futures');
  readonly forexCategories:   InstrumentCategory[] = this.categoryService.byType('forex');

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

  constructor() {
    inject(Title).setTitle('Market – MarketWatch');
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