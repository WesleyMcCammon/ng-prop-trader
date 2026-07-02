import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IndicatorService } from '../../core/services/indicator.service';

interface IndicatorLevel {
  id: string;
  label: string;
  name: string;
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
      { id: 'pivots.r3',    label: 'R3',    name: 'R3' },
      { id: 'pivots.r2',    label: 'R2',    name: 'R2' },
      { id: 'pivots.r1',    label: 'R1',    name: 'R1' },
      { id: 'pivots.pivot', label: 'Pivot', name: 'Pivot' },
      { id: 'pivots.s1',    label: 'S1',    name: 'S1' },
      { id: 'pivots.s2',    label: 'S2',    name: 'S2' },
      { id: 'pivots.s3',    label: 'S3',    name: 'S3' },
    ],
  },
  {
    id: 'vwap',
    name: 'VWAP',
    levels: [
      { id: 'vwap.sd3',  label: 'SD +3', name: 'Standard Deviation +3' },
      { id: 'vwap.sd2',  label: 'SD +2', name: 'Standard Deviation +2' },
      { id: 'vwap.sd1',  label: 'SD +1', name: 'Standard Deviation +1' },
      { id: 'vwap.vwap', label: 'VWAP',  name: 'Volume Weighted Average Price' },
      { id: 'vwap.sm1',  label: 'SD -1', name: 'Standard Deviation -1' },
      { id: 'vwap.sm2',  label: 'SD -2', name: 'Standard Deviation -2' },
      { id: 'vwap.sm3',  label: 'SD -3', name: 'Standard Deviation -3' },
    ],
  },
  {
    id: 'volumeProfile',
    name: 'Volume Profile',
    levels: [
      { id: 'vp.vah', label: 'VAH',  name: 'Value Area High' },
      { id: 'vp.poc', label: 'POC', name: 'Point of Control' },
      { id: 'vp.val', label: 'VAL',   name: 'Value Area Low' },
    ],
  },
  {
    id: 'openingRange',
    name: 'Opening Range',
    levels: [
      { id: 'or.high', label: 'High', name: 'High' },
      { id: 'or.low',  label: 'Low',  name: 'Low' },
    ],
  },
  {
    id: 'prevDayOHLC',
    name: 'Prev Day OHLC',
    levels: [
      { id: 'pd.asia.open',  label: 'Asia Open',     name: 'Asia Open' },
      { id: 'pd.asia.high',  label: 'Asia High',     name: 'Asia High' },
      { id: 'pd.asia.low',   label: 'Asia Low',      name: 'Asia Low' },
      { id: 'pd.asia.close', label: 'Asia Close',    name: 'Asia Close' },
      { id: 'pd.lon.open',   label: 'London Open',   name: 'London Open' },
      { id: 'pd.lon.high',   label: 'London High',   name: 'London High' },
      { id: 'pd.lon.low',    label: 'London Low',    name: 'London Low' },
      { id: 'pd.lon.close',  label: 'London Close',  name: 'London Close' },
      { id: 'pd.ny.open',    label: 'New York Open',  name: 'New York Open' },
      { id: 'pd.ny.high',    label: 'New York High',  name: 'New York High' },
      { id: 'pd.ny.low',     label: 'New York Low',   name: 'New York Low' },
      { id: 'pd.ny.close',   label: 'New York Close', name: 'New York Close' },
    ],
  },
  {
    id: 'weeklyOHLC',
    name: 'Weekly OHLC',
    levels: [
      { id: 'wk.open',  label: 'Open',  name: 'Open' },
      { id: 'wk.high',  label: 'High',  name: 'High' },
      { id: 'wk.low',   label: 'Low',   name: 'Low' },
      { id: 'wk.close', label: 'Close', name: 'Close' },
    ],
  },
];

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss',
})
export class IndicatorsComponent {
  readonly svc = inject(IndicatorService);
  readonly groups: IndicatorGroup[] = GROUPS_DEF.map(g => ({ ...g, show: signal(true) }));

  constructor() {
    inject(Title).setTitle('Indicators – MarketWatch');
  }

  isGroupEnabled(groupId: string): boolean {
    return this.svc.isGroupEnabled(groupId);
  }

  toggleGroupEnabled(group: IndicatorGroup): void {
    this.svc.toggleGroupEnabled(group.id, group.levels.map(l => l.id));
  }

  isActive(levelId: string): boolean {
    return this.svc.isLevelActive(levelId);
  }

  toggleLevel(groupId: string, levelId: string): void {
    this.svc.toggleLevel(groupId, levelId);
  }

  isGroupAllActive(group: IndicatorGroup): boolean {
    return this.svc.isGroupAllActive(group.levels.map(l => l.id));
  }

  toggleGroup(group: IndicatorGroup): void {
    this.svc.toggleGroupLevels(group.id, group.levels.map(l => l.id));
  }

  activeInGroup(group: IndicatorGroup): number {
    return this.svc.countActiveLevels(group.levels.map(l => l.id));
  }
}

