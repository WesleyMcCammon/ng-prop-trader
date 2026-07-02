import { Component, ElementRef, Input, computed, effect, inject } from '@angular/core';
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
  private elRef             = inject(ElementRef);
  readonly pinService       = inject(PinService);

  pinned = computed(() => {
    const symbols = this.pinService.pinnedSymbols();
    return this.instrumentService.instruments().filter(i => symbols.has(i.symbol));
  });

  orderedPinned = computed(() => this.pinService.applyOrder(this.pinned()));

  constructor() {
    effect(() => {
      const ev = this.pinService.justPinned();
      if (!ev) return;
      const sourceRect = this.pinService.pendingSourceRect;
      if (!sourceRect) return;

      const { symbol } = ev;

      setTimeout(() => {
        const host = (this.elRef.nativeElement as HTMLElement)
          .querySelector(`app-instrument-card[data-symbol="${symbol}"]`);
        const cardEl = host?.querySelector('.instrument-card') as HTMLElement | null;
        if (!cardEl) return;

        const targetRect = cardEl.getBoundingClientRect();
        const dx = sourceRect.left - targetRect.left;
        const dy = sourceRect.top - targetRect.top;

        cardEl.style.transition = 'none';
        cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
        cardEl.style.opacity = '0.5';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            cardEl.style.transition =
              'transform 380ms cubic-bezier(0.4, 0, 0.2, 1), opacity 280ms ease-out 60ms';
            cardEl.style.transform = '';
            cardEl.style.opacity = '';

            cardEl.addEventListener('transitionend', () => {
              cardEl.style.transition = '';
              this.pinService.pendingSourceRect = null;
            }, { once: true });
          });
        });
      }, 0);
    });
  }

  onDrop(event: CdkDragDrop<FuturesContract[]>): void {
    const items = [...this.orderedPinned()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.pinService.pinnedOrder.set(items.map(i => i.symbol));
  }
}