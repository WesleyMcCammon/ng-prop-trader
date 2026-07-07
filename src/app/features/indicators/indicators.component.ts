import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IndicatorService } from '../../core/services/indicator.service';
import { AdSidebarComponent } from '../../shared/components/ad-sidebar/ad-sidebar.component';
import { MockAd } from '../../shared/model/ad.model';

const INDICATOR_ADS: MockAd[] = [
  {
    sponsor: 'TrendSpider',
    headline: 'Automated Technical Analysis',
    body: 'Auto-detect trendlines, support/resistance, and patterns across every timeframe.',
    cta: 'Start Free Trial'
  },
  {
    sponsor: 'Trade Ideas',
    headline: 'AI-Powered Scanning',
    body: 'Let an AI trading assistant surface high-probability setups in real time.',
    cta: 'See It in Action'
  },
  {
    sponsor: 'MotiveWave',
    headline: 'Elliott Wave & Fibonacci Tools',
    body: 'Professional-grade analysis tools trusted by technical traders for two decades.',
    cta: 'Try Free'
  }
];

interface IndicatorLevel {
  id: string;
  label: string;
  name: string;
  description: string;
}

interface IndicatorGroup {
  id: string;
  name: string;
  description: string;
  levels: IndicatorLevel[];
  show: ReturnType<typeof signal<boolean>>;
}

const GROUPS_DEF: Omit<IndicatorGroup, 'show'>[] = [
  {
    id: 'pivots',
    name: 'Pivots',
    description: 'Classic floor-trader pivot points calculated from the prior session’s high, low, and close.',
    levels: [
      { id: 'pivots.r3',    label: 'R3',    name: 'R3',    description: 'Third resistance level, furthest above the pivot.' },
      { id: 'pivots.r2',    label: 'R2',    name: 'R2',    description: 'Second resistance level above the pivot.' },
      { id: 'pivots.r1',    label: 'R1',    name: 'R1',    description: 'First resistance level above the pivot.' },
      { id: 'pivots.pivot', label: 'Pivot', name: 'Pivot', description: 'Central pivot point, the average of the prior session’s high, low, and close.' },
      { id: 'pivots.s1',    label: 'S1',    name: 'S1',    description: 'First support level below the pivot.' },
      { id: 'pivots.s2',    label: 'S2',    name: 'S2',    description: 'Second support level below the pivot.' },
      { id: 'pivots.s3',    label: 'S3',    name: 'S3',    description: 'Third support level, furthest below the pivot.' },
    ],
  },
  {
    id: 'vwap',
    name: 'VWAP',
    description: 'Volume-weighted average price and standard deviation bands for the current session.',
    levels: [
      { id: 'vwap.sd3',  label: 'SD +3', name: 'Standard Deviation +3', description: 'VWAP plus three standard deviations.' },
      { id: 'vwap.sd2',  label: 'SD +2', name: 'Standard Deviation +2', description: 'VWAP plus two standard deviations.' },
      { id: 'vwap.sd1',  label: 'SD +1', name: 'Standard Deviation +1', description: 'VWAP plus one standard deviation.' },
      { id: 'vwap.vwap', label: 'VWAP',  name: 'Volume Weighted Average Price', description: 'Volume-weighted average price for the current session.' },
      { id: 'vwap.sm1',  label: 'SD -1', name: 'Standard Deviation -1', description: 'VWAP minus one standard deviation.' },
      { id: 'vwap.sm2',  label: 'SD -2', name: 'Standard Deviation -2', description: 'VWAP minus two standard deviations.' },
      { id: 'vwap.sm3',  label: 'SD -3', name: 'Standard Deviation -3', description: 'VWAP minus three standard deviations.' },
    ],
  },
  {
    id: 'volumeProfile',
    name: 'Volume Profile',
    description: 'Price levels where the most trading volume occurred during the session.',
    levels: [
      { id: 'vp.vah', label: 'VAH', name: 'Value Area High',  description: 'Top of the range containing the bulk of traded volume.' },
      { id: 'vp.poc', label: 'POC', name: 'Point of Control', description: 'The single price level with the highest traded volume.' },
      { id: 'vp.val', label: 'VAL', name: 'Value Area Low',   description: 'Bottom of the range containing the bulk of traded volume.' },
    ],
  },
  {
    id: 'openingRange',
    name: 'Opening Range',
    description: 'The high and low of the opening range window at the start of the session.',
    levels: [
      { id: 'or.high', label: 'High', name: 'High', description: 'High of the opening range window.' },
      { id: 'or.low',  label: 'Low',  name: 'Low',  description: 'Low of the opening range window.' },
    ],
  },
  {
    id: 'prevDayOHLC',
    name: 'Prev Day OHLC',
    description: 'Open, high, low, and close from the prior session’s Asia, London, and New York windows.',
    levels: [
      { id: 'pd.asia.open',  label: 'Asia Open',     name: 'Asia Open',     description: 'Opening price during the prior session’s Asia trading window.' },
      { id: 'pd.asia.high',  label: 'Asia High',     name: 'Asia High',     description: 'High price during the prior session’s Asia trading window.' },
      { id: 'pd.asia.low',   label: 'Asia Low',      name: 'Asia Low',      description: 'Low price during the prior session’s Asia trading window.' },
      { id: 'pd.asia.close', label: 'Asia Close',    name: 'Asia Close',    description: 'Closing price during the prior session’s Asia trading window.' },
      { id: 'pd.lon.open',   label: 'London Open',   name: 'London Open',   description: 'Opening price during the prior session’s London trading window.' },
      { id: 'pd.lon.high',   label: 'London High',   name: 'London High',   description: 'High price during the prior session’s London trading window.' },
      { id: 'pd.lon.low',    label: 'London Low',    name: 'London Low',    description: 'Low price during the prior session’s London trading window.' },
      { id: 'pd.lon.close',  label: 'London Close',  name: 'London Close',  description: 'Closing price during the prior session’s London trading window.' },
      { id: 'pd.ny.open',    label: 'New York Open',  name: 'New York Open',  description: 'Opening price during the prior session’s New York trading window.' },
      { id: 'pd.ny.high',    label: 'New York High',  name: 'New York High',  description: 'High price during the prior session’s New York trading window.' },
      { id: 'pd.ny.low',     label: 'New York Low',   name: 'New York Low',   description: 'Low price during the prior session’s New York trading window.' },
      { id: 'pd.ny.close',   label: 'New York Close', name: 'New York Close', description: 'Closing price during the prior session’s New York trading window.' },
    ],
  },
  {
    id: 'weeklyOHLC',
    name: 'Weekly OHLC',
    description: 'Open, high, low, and close from the prior trading week.',
    levels: [
      { id: 'wk.open',  label: 'Open',  name: 'Open',  description: 'Opening price of the prior trading week.' },
      { id: 'wk.high',  label: 'High',  name: 'High',  description: 'High price of the prior trading week.' },
      { id: 'wk.low',   label: 'Low',   name: 'Low',   description: 'Low price of the prior trading week.' },
      { id: 'wk.close', label: 'Close', name: 'Close', description: 'Closing price of the prior trading week.' },
    ],
  },
];

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [AdSidebarComponent],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss',
})
export class IndicatorsComponent {
  readonly svc = inject(IndicatorService);
  readonly groups: IndicatorGroup[] = GROUPS_DEF.map(g => ({ ...g, show: signal(true) }));
  readonly ads = INDICATOR_ADS;

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

