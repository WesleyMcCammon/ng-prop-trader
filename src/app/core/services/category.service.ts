import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { InstrumentCategory } from '../../shared/model/instrument.model';

export const CATEGORIES: InstrumentCategory[] = [
  'Indices',
  'Metals',
  'Energies',
  'Financials',
  'Currencies',
  'Forex Majors',
  'Forex Minors',
  'CFDs',
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  readonly categories: InstrumentCategory[] = CATEGORIES;

  private readonly _selected$ = new BehaviorSubject<InstrumentCategory[]>([...CATEGORIES]);
  readonly selectedCategories$: Observable<InstrumentCategory[]> = this._selected$.asObservable();

  get selected(): InstrumentCategory[] {
    return this._selected$.value;
  }

  selectAll(): void {
    this._selected$.next([...CATEGORIES]);
  }

  selectNone(): void {
    this._selected$.next([]);
  }

  toggle(category: InstrumentCategory): void {
    const current = this._selected$.value;
    const next = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    this._selected$.next(next);
  }

  isSelected(category: InstrumentCategory): boolean {
    return this._selected$.value.includes(category);
  }
}
