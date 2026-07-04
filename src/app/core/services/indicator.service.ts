import { Injectable, computed, effect, signal } from '@angular/core';
import { INDICATORS, INDICATORS_MAP, LEVEL_VALUES } from '../../data/indicators.data';
import { InstrumentIndicators } from '../../shared/model/indicator.model';

export type { InstrumentIndicators, PivotLevels, VWAPLevels, VolumeProfile, OpeningRange, DayOHLC, WeekOHLC, OHLC } from '../../shared/model/indicator.model';

export interface ActiveLevelDisplay {
  levelId: string;
  groupName: string;
  groupDescription: string;
  label: string;
  description: string;
  value: number;
  delta: number;
}

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

const LEVEL_GROUPS: Record<string, string> = {
  'pivots.r3': 'Pivots',  'pivots.r2': 'Pivots',  'pivots.r1': 'Pivots',
  'pivots.pivot': 'Pivots', 'pivots.s1': 'Pivots', 'pivots.s2': 'Pivots', 'pivots.s3': 'Pivots',
  'vwap.sd3': 'VWAP',     'vwap.sd2': 'VWAP',     'vwap.sd1': 'VWAP',
  'vwap.vwap': 'VWAP',    'vwap.sm1': 'VWAP',     'vwap.sm2': 'VWAP',    'vwap.sm3': 'VWAP',
  'vp.vah': 'Vol Profile', 'vp.poc': 'Vol Profile', 'vp.val': 'Vol Profile',
  'or.high': 'Opening Rng', 'or.low': 'Opening Rng',
  'pd.asia.open':  'Prev Day', 'pd.asia.high':  'Prev Day', 'pd.asia.low':  'Prev Day', 'pd.asia.close':  'Prev Day',
  'pd.lon.open':   'Prev Day', 'pd.lon.high':   'Prev Day', 'pd.lon.low':   'Prev Day', 'pd.lon.close':   'Prev Day',
  'pd.ny.open':    'Prev Day', 'pd.ny.high':    'Prev Day', 'pd.ny.low':    'Prev Day', 'pd.ny.close':    'Prev Day',
  'wk.open': 'Weekly', 'wk.high': 'Weekly', 'wk.low': 'Weekly', 'wk.close': 'Weekly',
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  'Pivots':      'Classic floor-trader pivot points calculated from the prior session’s high, low, and close.',
  'VWAP':        'Volume-weighted average price and standard deviation bands for the current session.',
  'Vol Profile': 'Price levels where the most trading volume occurred during the session.',
  'Opening Rng': 'The high and low of the opening range window at the start of the session.',
  'Prev Day':    'Open, high, low, and close from the prior session’s Asia, London, and New York windows.',
  'Weekly':      'Open, high, low, and close from the prior trading week.',
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  'pivots.r3':    'Third resistance level, furthest above the pivot.',
  'pivots.r2':    'Second resistance level above the pivot.',
  'pivots.r1':    'First resistance level above the pivot.',
  'pivots.pivot': 'Central pivot point, the average of the prior session’s high, low, and close.',
  'pivots.s1':    'First support level below the pivot.',
  'pivots.s2':    'Second support level below the pivot.',
  'pivots.s3':    'Third support level, furthest below the pivot.',
  'vwap.sd3': 'VWAP plus three standard deviations.',
  'vwap.sd2': 'VWAP plus two standard deviations.',
  'vwap.sd1': 'VWAP plus one standard deviation.',
  'vwap.vwap': 'Volume-weighted average price for the current session.',
  'vwap.sm1': 'VWAP minus one standard deviation.',
  'vwap.sm2': 'VWAP minus two standard deviations.',
  'vwap.sm3': 'VWAP minus three standard deviations.',
  'vp.vah': 'Value Area High — top of the range containing the bulk of traded volume.',
  'vp.poc': 'Point of Control — the single price level with the highest traded volume.',
  'vp.val': 'Value Area Low — bottom of the range containing the bulk of traded volume.',
  'or.high': 'High of the opening range window.',
  'or.low':  'Low of the opening range window.',
  'pd.asia.open':  'Opening price during the prior session’s Asia trading window.',
  'pd.asia.high':  'High price during the prior session’s Asia trading window.',
  'pd.asia.low':   'Low price during the prior session’s Asia trading window.',
  'pd.asia.close': 'Closing price during the prior session’s Asia trading window.',
  'pd.lon.open':   'Opening price during the prior session’s London trading window.',
  'pd.lon.high':   'High price during the prior session’s London trading window.',
  'pd.lon.low':    'Low price during the prior session’s London trading window.',
  'pd.lon.close':  'Closing price during the prior session’s London trading window.',
  'pd.ny.open':    'Opening price during the prior session’s New York trading window.',
  'pd.ny.high':    'High price during the prior session’s New York trading window.',
  'pd.ny.low':     'Low price during the prior session’s New York trading window.',
  'pd.ny.close':   'Closing price during the prior session’s New York trading window.',
  'wk.open':  'Opening price of the prior trading week.',
  'wk.high':  'High price of the prior trading week.',
  'wk.low':   'Low price of the prior trading week.',
  'wk.close': 'Closing price of the prior trading week.',
};

const STORAGE_GROUPS = 'mw.activeGroups';
const STORAGE_LEVELS = 'mw.activeLevels';

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

@Injectable({ providedIn: 'root' })
export class IndicatorService {
  private readonly _indicators = signal<InstrumentIndicators[]>(INDICATORS);

  readonly indicators  = this._indicators.asReadonly();
  readonly dayDates:  string[] = INDICATORS[0]?.prevDayOHLC.map(d => d.date)  ?? [];
  readonly weekDates: string[] = INDICATORS[0]?.weeklyOHLC.map(w => w.weekOf) ?? [];

  // ── Selection state (shared with indicators admin and market overview) ──────
  readonly activeGroups = signal<Set<string>>(loadSet(STORAGE_GROUPS));
  readonly activeLevels = signal<Set<string>>(loadSet(STORAGE_LEVELS));
  readonly totalActive  = computed(() => this.activeLevels().size);

  constructor() {
    effect(() => localStorage.setItem(STORAGE_GROUPS, JSON.stringify([...this.activeGroups()])));
    effect(() => localStorage.setItem(STORAGE_LEVELS, JSON.stringify([...this.activeLevels()])));
  }

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
      .map(levelId => {
        const groupName = LEVEL_GROUPS[levelId] ?? '';
        return {
          levelId,
          groupName,
          groupDescription: GROUP_DESCRIPTIONS[groupName] ?? '',
          label: LEVEL_LABELS[levelId] ?? levelId,
          description: LEVEL_DESCRIPTIONS[levelId] ?? '',
          value: values[levelId] ?? 0,
          delta: (values[levelId] ?? 0) - bid,
        };
      })
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
  }
}