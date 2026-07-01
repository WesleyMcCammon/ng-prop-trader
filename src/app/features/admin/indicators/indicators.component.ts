import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

interface IndicatorLevel {
  id: string;
  label: string;
}

interface IndicatorGroup {
  id: string;
  name: string;
  levels: IndicatorLevel[];
  show: ReturnType<typeof signal<boolean>>;
}

const GROUPS_DEF: Omit<IndicatorGroup, 'show'>[] = [
  {
    id: 'pivots',
    name: 'Pivots',
    levels: [
      { id: 'pivots.r3',    label: 'R3' },
      { id: 'pivots.r2',    label: 'R2' },
      { id: 'pivots.r1',    label: 'R1' },
      { id: 'pivots.pivot', label: 'Pivot' },
      { id: 'pivots.s1',    label: 'S1' },
      { id: 'pivots.s2',    label: 'S2' },
      { id: 'pivots.s3',    label: 'S3' },
    ],
  },
  {
    id: 'vwap',
    name: 'VWAP',
    levels: [
      { id: 'vwap.sd3',  label: 'SD +3' },
      { id: 'vwap.sd2',  label: 'SD +2' },
      { id: 'vwap.sd1',  label: 'SD +1' },
      { id: 'vwap.vwap', label: 'VWAP' },
      { id: 'vwap.sm1',  label: 'SD -1' },
      { id: 'vwap.sm2',  label: 'SD -2' },
      { id: 'vwap.sm3',  label: 'SD -3' },
    ],
  },
  {
    id: 'volumeProfile',
    name: 'Volume Profile',
    levels: [
      { id: 'vp.vah', label: 'Value Area High' },
      { id: 'vp.poc', label: 'Point of Control' },
      { id: 'vp.val', label: 'Value Area Low' },
    ],
  },
  {
    id: 'openingRange',
    name: 'Opening Range',
    levels: [
      { id: 'or.high', label: 'High' },
      { id: 'or.low',  label: 'Low' },
    ],
  },
  {
    id: 'prevDayOHLC',
    name: 'Prev Day OHLC',
    levels: [
      { id: 'pd.asia.open',  label: 'Asia – Open' },
      { id: 'pd.asia.high',  label: 'Asia – High' },
      { id: 'pd.asia.low',   label: 'Asia – Low' },
      { id: 'pd.asia.close', label: 'Asia – Close' },
      { id: 'pd.lon.open',   label: 'London – Open' },
      { id: 'pd.lon.high',   label: 'London – High' },
      { id: 'pd.lon.low',    label: 'London – Low' },
      { id: 'pd.lon.close',  label: 'London – Close' },
      { id: 'pd.ny.open',    label: 'New York – Open' },
      { id: 'pd.ny.high',    label: 'New York – High' },
      { id: 'pd.ny.low',     label: 'New York – Low' },
      { id: 'pd.ny.close',   label: 'New York – Close' },
    ],
  },
  {
    id: 'weeklyOHLC',
    name: 'Weekly OHLC',
    levels: [
      { id: 'wk.open',  label: 'Open' },
      { id: 'wk.high',  label: 'High' },
      { id: 'wk.low',   label: 'Low' },
      { id: 'wk.close', label: 'Close' },
    ],
  },
];

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss',
})
export class IndicatorsComponent {
  readonly groups: IndicatorGroup[] = GROUPS_DEF.map(g => ({ ...g, show: signal(true) }));

  activeGroups = signal<Set<string>>(new Set());
  activeLevels = signal<Set<string>>(new Set());
  totalActive  = computed(() => this.activeLevels().size);

  constructor() {
    inject(Title).setTitle('Indicators – MarketWatch');
  }

  isGroupEnabled(groupId: string): boolean {
    return this.activeGroups().has(groupId);
  }

  toggleGroupEnabled(group: IndicatorGroup): void {
    const enabling = !this.isGroupEnabled(group.id);
    this.activeGroups.update(set => {
      const next = new Set(set);
      enabling ? next.add(group.id) : next.delete(group.id);
      return next;
    });
    if (!enabling) {
      this.activeLevels.update(set => {
        const next = new Set(set);
        group.levels.forEach(l => next.delete(l.id));
        return next;
      });
    }
  }

  isActive(id: string): boolean {
    return this.activeLevels().has(id);
  }

  toggleLevel(groupId: string, levelId: string): void {
    if (!this.isGroupEnabled(groupId)) return;
    this.activeLevels.update(set => {
      const next = new Set(set);
      next.has(levelId) ? next.delete(levelId) : next.add(levelId);
      return next;
    });
  }

  isGroupAllActive(group: IndicatorGroup): boolean {
    const active = this.activeLevels();
    return group.levels.length > 0 && group.levels.every(l => active.has(l.id));
  }

  toggleGroup(group: IndicatorGroup): void {
    if (!this.isGroupEnabled(group.id)) return;
    const selectAll = !this.isGroupAllActive(group);
    this.activeLevels.update(set => {
      const next = new Set(set);
      group.levels.forEach(l => selectAll ? next.add(l.id) : next.delete(l.id));
      return next;
    });
  }

  activeInGroup(group: IndicatorGroup): number {
    const active = this.activeLevels();
    return group.levels.filter(l => active.has(l.id)).length;
  }
}
