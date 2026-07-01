import { Component, computed, inject } from '@angular/core';
import { InstrumentService } from '../../../core/services/instrument.service';
import { PinService } from '../../../core/services/pin.service';
import { InstrumentCardComponent } from '../../../shared/components/instrument-card/instrument-card.component';

@Component({
  selector: 'app-pinned-instruments',
  standalone: true,
  imports: [InstrumentCardComponent],
  templateUrl: './pinned-instruments.component.html',
  styleUrl: './pinned-instruments.component.scss',
})
export class PinnedInstrumentsComponent {
  private instrumentService = inject(InstrumentService);
  readonly pinService       = inject(PinService);

  pinned = computed(() => {
    const symbols = this.pinService.pinnedSymbols();
    return this.instrumentService.instruments().filter(i => symbols.has(i.symbol));
  });
}