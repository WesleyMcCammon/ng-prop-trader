import { Component, ElementRef, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuturesContract } from '../../model/instrument.model';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { IndicatorService, ActiveLevelDisplay } from '../../../core/services/indicator.service';
import { PinService } from '../../../core/services/pin.service';
import { CandlestickChartComponent } from '../candlestick-chart/candlestick-chart.component';

const EXPAND_MARGIN = 24;
const EXPAND_TRANSITION =
  'top 320ms cubic-bezier(0.4, 0, 0.2, 1), left 320ms cubic-bezier(0.4, 0, 0.2, 1), ' +
  'width 320ms cubic-bezier(0.4, 0, 0.2, 1), height 320ms cubic-bezier(0.4, 0, 0.2, 1)';

@Component({
  selector: 'app-instrument-card',
  standalone: true,
  imports: [CommonModule, PriceFormatPipe, CandlestickChartComponent],
  templateUrl: './instrument-card.component.html',
  styleUrl: './instrument-card.component.scss'
})
export class InstrumentCardComponent {
  @Input({ required: true }) instrument!: FuturesContract;
  @Input() showType       = false;
  @Input() showPin        = true;
  @Input() showExpand     = false;
  @Input() hideAllLevels  = false;
  @Input() animateUnpin   = false;

  readonly hideLevels = signal(false);

  // `expanded` drives the badge label; `expandedLayout` stays true for the
  // full duration of the collapse animation so content doesn't snap back
  // before the card has visually shrunk.
  readonly expanded       = signal(false);
  readonly expandedLayout = signal(false);

  private indicatorService = inject(IndicatorService);
  private elRef             = inject(ElementRef);
  readonly pinService      = inject(PinService);

  activeLevels(): ActiveLevelDisplay[] {
    const levels = this.indicatorService
      .getActiveLevelsForInstrument(this.instrument.symbol, this.instrument.bid);
    return this.expandedLayout() ? levels : levels.slice(0, 3);
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

  toggleExpand(event: Event): void {
    event.stopPropagation();
    const cardEl = (this.elRef.nativeElement as HTMLElement).querySelector('.instrument-card') as HTMLElement;
    if (!cardEl) return;

    if (this.expanded()) {
      this.collapseCard(cardEl);
    } else {
      this.expandCard(cardEl);
    }
  }

  private expandCard(cardEl: HTMLElement): void {
    const hostEl = this.elRef.nativeElement as HTMLElement;
    const startRect = cardEl.getBoundingClientRect();

    // Freeze the grid slot so the layout doesn't reflow once the card goes fixed.
    hostEl.style.width  = `${startRect.width}px`;
    hostEl.style.height = `${startRect.height}px`;

    this.expanded.set(true);
    this.expandedLayout.set(true);

    cardEl.style.position   = 'fixed';
    cardEl.style.margin     = '0';
    cardEl.style.zIndex     = '1000';
    cardEl.style.transition = 'none';
    cardEl.style.top    = `${startRect.top}px`;
    cardEl.style.left   = `${startRect.left}px`;
    cardEl.style.width  = `${startRect.width}px`;
    cardEl.style.height = `${startRect.height}px`;

    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cardEl.style.transition = EXPAND_TRANSITION;
        cardEl.style.top    = `${EXPAND_MARGIN}px`;
        cardEl.style.left   = `${EXPAND_MARGIN}px`;
        cardEl.style.width  = `calc(100vw - ${EXPAND_MARGIN * 2}px)`;
        cardEl.style.height = `calc(100vh - ${EXPAND_MARGIN * 2}px)`;

        cardEl.addEventListener('transitionend', () => {
          cardEl.style.transition = '';
        }, { once: true });
      });
    });
  }

  private collapseCard(cardEl: HTMLElement): void {
    const hostEl = this.elRef.nativeElement as HTMLElement;
    const targetRect = hostEl.getBoundingClientRect();

    this.expanded.set(false);
    document.body.style.overflow = '';

    cardEl.style.transition = EXPAND_TRANSITION;
    cardEl.style.top    = `${targetRect.top}px`;
    cardEl.style.left   = `${targetRect.left}px`;
    cardEl.style.width  = `${targetRect.width}px`;
    cardEl.style.height = `${targetRect.height}px`;

    cardEl.addEventListener('transitionend', () => {
      cardEl.style.position   = '';
      cardEl.style.top        = '';
      cardEl.style.left       = '';
      cardEl.style.width      = '';
      cardEl.style.height     = '';
      cardEl.style.margin     = '';
      cardEl.style.zIndex     = '';
      cardEl.style.transition = '';
      hostEl.style.width  = '';
      hostEl.style.height = '';
      this.expandedLayout.set(false);
    }, { once: true });
  }
}