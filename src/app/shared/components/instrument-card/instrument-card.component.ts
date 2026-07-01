import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuturesContract } from '../../model/instrument.model';

@Component({
  selector: 'app-instrument-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instrument-card.component.html',
  styleUrl: './instrument-card.component.scss'
})
export class InstrumentCardComponent {
  @Input({ required: true }) instrument!: FuturesContract;
}