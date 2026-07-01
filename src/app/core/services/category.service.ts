import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoryDescriptor, InstrumentCategory, InstrumentType } from '../../shared/model/instrument.model';

export const CATEGORIES: CategoryDescriptor[] = [
  { name: 'Indices',      type: 'futures' },
  { name: 'Metals',       type: 'futures' },
  { name: 'Energies',     type: 'futures' },
  { name: 'Financials',   type: 'futures' },
  { name: 'Currencies',   type: 'futures' },
  { name: 'Forex Majors', type: 'forex' },
  { name: 'Forex Minors', type: 'forex' },
  { name: 'CFDs',         type: 'cfd' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  readonly categories: CategoryDescriptor[] = CATEGORIES;

  private readonly allNames: InstrumentCategory[] = CATEGORIES.map(c => c.name);

  private readonly _selected$ = new BehaviorSubject<InstrumentCategory[]>([...this.allNames]);
  readonly selectedCategories$: Observable<InstrumentCategory[]> = this._selected$.asObservable();

  get selected(): InstrumentCategory[] {
    return this._selected$.value;
  }

  selectAll(): void {
    this._selected$.next([...this.allNames]);
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

  getType(category: InstrumentCategory): InstrumentType {
    return CATEGORIES.find(c => c.name === category)!.type;
  }

  byType(type: InstrumentType): InstrumentCategory[] {
    return CATEGORIES.filter(c => c.type === type).map(c => c.name);
  }
}