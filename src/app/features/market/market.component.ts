import { Component, computed, inject } from '@angular/core';
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

  futures = computed(() => this.instruments().filter(i => i.type === 'futures'));
  forex   = computed(() => this.instruments().filter(i => i.type === 'forex'));
  cfds    = computed(() => this.instruments().filter(i => i.type === 'cfd'));

  constructor() {
    inject(Title).setTitle('Market – MarketWatch');
  }
}