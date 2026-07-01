import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuturesContract } from '../../model/instrument.model';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-instrument-card',
  standalone: true,
  imports: [CommonModule, PriceFormatPipe],
  templateUrl: './instrument-card.component.html',
  styleUrl: './instrument-card.component.scss'
})
export class InstrumentCardComponent {
  @Input({ required: true }) instrument!: FuturesContract;
}