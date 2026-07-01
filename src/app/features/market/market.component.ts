import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { InstrumentService } from '../../core/services/instrument.service';
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

  instruments = this.instrumentService.instruments;

  showFutures = signal(true);
  showForex   = signal(true);
  showCfds    = signal(true);
  showMicro   = signal(true);

  futures = computed(() => {
    const micro = this.showMicro();
    return this.instruments().filter(i =>
      i.type === 'futures' && (micro || !i.name.startsWith('Micro'))
    );
  });
  forex = computed(() => this.instruments().filter(i => i.type === 'forex'));
  cfds  = computed(() => this.instruments().filter(i => i.type === 'cfd'));

  constructor() {
    inject(Title).setTitle('Market – MarketWatch');
  }
}