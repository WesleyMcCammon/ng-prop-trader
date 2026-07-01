import { Injectable, computed, signal } from '@angular/core';
import { INDICATORS, INDICATORS_MAP, LEVEL_VALUES } from '../../data/indicators.data';
import { InstrumentIndicators } from '../../shared/model/indicator.model';

export type { InstrumentIndicators, PivotLevels, VWAPLevels, VolumeProfile, OpeningRange, DayOHLC, WeekOHLC, OHLC } from '../../shared/model/indicator.model';

export interface ActiveLevelDisplay {
  levelId: string;
  label: string;
  value: number;
  delta: number;
}

// Compact labels for card display (mirrors the `label` field in the component's GROUPS_DEF)
const LEVEL_LABELS: Record<string, string> = {
  'pivots.r3': 'R3',       'pivots.r2': 'R2',     'pivots.r1': 'R1',
  'pivots.pivot': 'Pivot', 'pivots.s1': 'S1',     'pivots.s2': 'S2',     'pivots.s3': 'S3',
  'vwap.sd3': 'SD +3',     'vwap.sd2': 'SD +2',   'vwap.sd1': 'SD +1',
  'vwap.vwap': 'VWAP',
  'vwap.sm1': 'SD -1',     'vwap.sm2': 'SD -2',   'vwap.sm3': 'SD -3',
  'vp.vah': 'VAH',         'vp.poc': 'POC',        'vp.val': 'VAL',
  'or.high': 'OR High',    'or.low': 'OR Low',
  'pd.asia.open':  'Asia O',   'pd.asia.high':  'Asia H',   'pd.asia.low':  'Asia L',  'pd.asia.close':  'Asia C',
  'pd.lon.open':   'Lon O',    'pd.lon.high':   'Lon H',    'pd.lon.low':   'Lon L',   'pd.lon.close':   'Lon C',
  'pd.ny.open':    'NY O',     'pd.ny.high':    'NY H',     'pd.ny.low':    'NY L',    'pd.ny.close':    'NY C',
  'wk.open':  'Wk O',     'wk.high':  'Wk H',    'wk.low':  'Wk L',    'wk.close': 'Wk C',
};

@Injectable({ providedIn: 'root' })
export class IndicatorService {
  private readonly _indicators = signal<InstrumentIndicators[]>(INDICATORS);

  readonly indicators  = this._indicators.asReadonly();
  readonly dayDates:  string[] = INDICATORS[0]?.prevDayOHLC.map(d => d.date)  ?? [];
  readonly weekDates: string[] = INDICATORS[0]?.weeklyOHLC.map(w => w.weekOf) ?? [];

  // ── Selection state (shared with indicators admin and market overview) ──────
  readonly activeGroups = signal<Set<string>>(new Set());
  readonly activeLevels = signal<Set<string>>(new Set());
  readonly totalActive  = computed(() => this.activeLevels().size);

  // ── Selection methods ────────────────────────────────────────────────────────
  isGroupEnabled(groupId: string): boolean {
    return this.activeGroups().has(groupId);
  }

  toggleGroupEnabled(groupId: string, levelIds: string[]): void {
    const enabling = !this.isGroupEnabled(groupId);
    this.activeGroups.update(set => {
      const next = new Set(set);
      enabling ? next.add(groupId) : next.delete(groupId);
      return next;
    });
    if (!enabling) {
      this.activeLevels.update(set => {
        const next = new Set(set);
        levelIds.forEach(id => next.delete(id));
        return next;
      });
    }
  }

  isLevelActive(levelId: string): boolean {
    return this.activeLevels().has(levelId);
  }

  toggleLevel(groupId: string, levelId: string): void {
    if (!this.isGroupEnabled(groupId)) return;
    this.activeLevels.update(set => {
      const next = new Set(set);
      next.has(levelId) ? next.delete(levelId) : next.add(levelId);
      return next;
    });
  }

  isGroupAllActive(levelIds: string[]): boolean {
    const active = this.activeLevels();
    return levelIds.length > 0 && levelIds.every(id => active.has(id));
  }

  toggleGroupLevels(groupId: string, levelIds: string[]): void {
    if (!this.isGroupEnabled(groupId)) return;
    const selectAll = !this.isGroupAllActive(levelIds);
    this.activeLevels.update(set => {
      const next = new Set(set);
      levelIds.forEach(id => selectAll ? next.add(id) : next.delete(id));
      return next;
    });
  }

  countActiveLevels(levelIds: string[]): number {
    const active = this.activeLevels();
    return levelIds.filter(id => active.has(id)).length;
  }

  // ── Lookup methods ───────────────────────────────────────────────────────────
  getBySymbol(symbol: string): InstrumentIndicators | undefined {
    return INDICATORS_MAP.get(symbol);
  }

  getLevelValue(symbol: string, levelId: string): number | undefined {
    return LEVEL_VALUES.get(symbol)?.[levelId];
  }

  getLevelValues(symbol: string): Record<string, number> | undefined {
    return LEVEL_VALUES.get(symbol);
  }

  getActiveLevelsForInstrument(symbol: string, bid: number): ActiveLevelDisplay[] {
    const values = LEVEL_VALUES.get(symbol);
    if (!values) return [];
    return [...this.activeLevels()]
      .map(levelId => ({
        levelId,
        label: LEVEL_LABELS[levelId] ?? levelId,
        value: values[levelId] ?? 0,
        delta: (values[levelId] ?? 0) - bid,
      }))
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
  }
}