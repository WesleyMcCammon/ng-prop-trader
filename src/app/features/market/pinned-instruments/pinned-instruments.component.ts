import { Component, computed, inject, signal } from '@angular/core';
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
  private instrumentService = inject(InstrumentService);
  readonly pinService       = inject(PinService);

  private pinnedOrder = signal<string[]>([]);

  pinned = computed(() => {
    const symbols = this.pinService.pinnedSymbols();
    return this.instrumentService.instruments().filter(i => symbols.has(i.symbol));
  });

  orderedPinned = computed(() => {
    const items = this.pinned();
    const order = this.pinnedOrder();
    if (order.length === 0) return items;
    const map = new Map(items.map(i => [i.symbol, i]));
    const ordered = order.filter(s => map.has(s)).map(s => map.get(s)!);
    const rest = items.filter(i => !order.includes(i.symbol));
    return [...ordered, ...rest];
  });

  onDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedPinned()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.pinnedOrder.set(items.map(i => i.symbol));
  }
}