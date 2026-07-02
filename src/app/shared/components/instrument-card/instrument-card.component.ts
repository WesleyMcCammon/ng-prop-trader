import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuturesContract } from '../../model/instrument.model';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { IndicatorService, ActiveLevelDisplay } from '../../../core/services/indicator.service';
import { PinService } from '../../../core/services/pin.service';

@Component({
  selector: 'app-instrument-card',
  standalone: true,
  imports: [CommonModule, PriceFormatPipe],
  templateUrl: './instrument-card.component.html',
  styleUrl: './instrument-card.component.scss'
})
export class InstrumentCardComponent {
  @Input({ required: true }) instrument!: FuturesContract;
  @Input() showType       = false;
  @Input() showPin        = true;
  @Input() hideAllLevels  = false;
  @Input() animateUnpin   = false;

  readonly hideLevels = signal(false);

  private indicatorService = inject(IndicatorService);
  readonly pinService      = inject(PinService);

  activeLevels(): ActiveLevelDisplay[] {
    return this.indicatorService
      .getActiveLevelsForInstrument(this.instrument.symbol, this.instrument.bid)
      .slice(0, 3);
  }

  onPinClick(event: Event): void {
    const cardEl = (event.currentTarget as HTMLElement).closest('.instrument-card') as HTMLElement;

    if (!this.pinService.isPinned(this.instrument.symbol)) {
      if (cardEl) {
        this.pinService.pendingSourceRect = cardEl.getBoundingClientRect();
        this.pinService.justPinned.set({ symbol: this.instrument.symbol, id: Date.now() });
      }
      this.pinService.toggle(this.instrument.symbol);
    } else if (this.animateUnpin && cardEl) {
      cardEl.classList.add('card--unpinning');
      cardEl.addEventListener('animationend', () => {
        this.pinService.toggle(this.instrument.symbol);
      }, { once: true });
    } else {
      this.pinService.toggle(this.instrument.symbol);
    }
  }
}