import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

const BAR_COUNT = 40;
const UP_COLOR = '#16a34a';
const DOWN_COLOR = '#dc2626';

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

@Component({
  selector: 'app-candlestick-chart',
  standalone: true,
  template: `<canvas #canvas class="candlestick-canvas"></canvas>`,
  styleUrl: './candlestick-chart.component.scss'
})
export class CandlestickChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) symbol!: string;
  @Input({ required: true }) tickSize!: number;
  @Input({ required: true }) price!: number;

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private resizeObserver?: ResizeObserver;
  private candles: Candle[] = [];

  ngAfterViewInit(): void {
    this.candles = this.generateCandles();
    this.draw();

    this.resizeObserver = new ResizeObserver(() => this.draw());
    const container = this.canvasRef.nativeElement.parentElement;
    if (container) this.resizeObserver.observe(container);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['price']?.firstChange || !this.canvasRef) return;
    this.candles = this.generateCandles();
    this.draw();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private generateCandles(): Candle[] {
    // Walk backward from the live price so the series always ends exactly
    // at the current bid/price with no discontinuity on the final bar.
    const rand = mulberry32(seedFromString(this.symbol));
    const step = this.tickSize * (10 + Math.floor(rand() * 40));
    const candles: Candle[] = new Array(BAR_COUNT);
    let close = this.price;

    for (let i = BAR_COUNT - 1; i >= 0; i--) {
      const drift = (rand() - 0.5) * step * 6;
      const open = Math.max(close - drift, this.tickSize);
      const high = Math.max(open, close) + rand() * step * 2;
      const low = Math.max(Math.min(open, close) - rand() * step * 2, this.tickSize / 2);
      candles[i] = { open, high, low, close };
      close = open;
    }

    return candles;
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container || this.candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight || 220;
    if (width === 0 || height === 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const styles = getComputedStyle(document.documentElement);
    const gridColor = styles.getPropertyValue('--color-border').trim() || '#e2e8f0';
    const labelColor = styles.getPropertyValue('--color-text-muted').trim() || '#64748b';

    const paddingLeft = 4;
    const paddingRight = 56;
    const paddingTop = 10;
    const paddingBottom = 10;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const high = Math.max(...this.candles.map(c => c.high));
    const low = Math.min(...this.candles.map(c => c.low));
    const range = (high - low) || 1;
    const yFor = (v: number) => paddingTop + chartHeight - ((v - low) / range) * chartHeight;

    const gridLines = 4;
    ctx.strokeStyle = gridColor;
    ctx.fillStyle = labelColor;
    ctx.font = '10px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const v = low + (range * i) / gridLines;
      const y = yFor(v);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + chartWidth, y);
      ctx.stroke();
      ctx.fillText(v.toFixed(this.decimals()), paddingLeft + chartWidth + 6, y);
    }

    const slot = chartWidth / this.candles.length;
    const bodyWidth = Math.max(1, slot * 0.6);

    this.candles.forEach((c, i) => {
      const x = paddingLeft + i * slot + slot / 2;
      const up = c.close >= c.open;
      const color = up ? UP_COLOR : DOWN_COLOR;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(x, yFor(c.high));
      ctx.lineTo(x, yFor(c.low));
      ctx.stroke();

      const bodyTop = yFor(Math.max(c.open, c.close));
      const bodyBottom = yFor(Math.min(c.open, c.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });
  }

  private decimals(): number {
    const s = parseFloat(this.tickSize.toPrecision(12)).toString();
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
  }
}
