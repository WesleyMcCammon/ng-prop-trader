import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'priceFormat', standalone: true })
export class PriceFormatPipe implements PipeTransform {
  transform(value: number, tickSize: number): string {
    return value.toFixed(this.decimals(tickSize));
  }

  private decimals(tickSize: number): number {
    const s = parseFloat(tickSize.toPrecision(12)).toString();
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
  }
}