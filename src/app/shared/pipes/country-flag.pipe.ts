import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'countryFlag', standalone: true })
export class CountryFlagPipe implements PipeTransform {
  transform(code: string): string {
    return code
      .toUpperCase()
      .split('')
      .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
      .join('');
  }
}
