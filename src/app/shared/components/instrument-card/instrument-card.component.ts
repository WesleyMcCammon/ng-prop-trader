import { Component, Input, inject } from '@angular/core';
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

  private indicatorService = inject(IndicatorService);
  readonly pinService      = inject(PinService);

  activeLevels(): ActiveLevelDisplay[] {
    return this.indicatorService
      .getActiveLevelsForInstrument(this.instrument.symbol, this.instrument.bid)
      .slice(0, 5);
  }
}