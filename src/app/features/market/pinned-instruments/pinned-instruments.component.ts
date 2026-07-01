import { Component, Input, computed, inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { InstrumentService } from '../../../core/services/instrument.service';
import { PinService } from '../../../core/services/pin.service';
import { FuturesContract } from '../../../shared/model/instrument.model';
import { InstrumentCardComponent } from '../../../shared/components/instrument-card/instrument-card.component';

@Component({
  selector: 'app-pinned-instruments',
  standalone: true,
  imports: [InstrumentCardComponent, DragDropModule],
  templateUrl: './pinned-instruments.component.html',
  styleUrl: './pinned-instruments.component.scss',
})
export class PinnedInstrumentsComponent {
  @Input() hideAllLevels = false;

  private instrumentService = inject(InstrumentService);
  readonly pinService       = inject(PinService);

  pinned = computed(() => {
    const symbols = this.pinService.pinnedSymbols();
    return this.instrumentService.instruments().filter(i => symbols.has(i.symbol));
  });

  orderedPinned = computed(() => this.pinService.applyOrder(this.pinned()));

  onDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedPinned()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.pinService.pinnedOrder.set(items.map(i => i.symbol));
  }
}