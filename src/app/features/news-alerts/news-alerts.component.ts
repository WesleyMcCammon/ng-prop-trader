import { Component, inject, OnInit, computed, effect, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DataService, Post } from '../../core/services/data.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AdSidebarComponent } from '../../shared/components/ad-sidebar/ad-sidebar.component';
import { MockAd } from '../../shared/model/ad.model';

const NEWS_ADS: MockAd[] = [
  {
    sponsor: 'Benzinga News',
    headline: 'Breaking News, Seconds Faster',
    body: 'Real-time squawk and headline alerts before they hit the wires.',
    cta: 'Try Free'
  },
  {
    sponsor: 'Forex Factory Premium',
    headline: 'Never Miss a Catalyst',
    body: 'High-impact economic calendar alerts sent straight to your phone.',
    cta: 'Get Alerts'
  },
  {
    sponsor: 'Trading Economics',
    headline: 'Global Data at Your Fingertips',
    body: 'Macro indicators and forecasts for 196 countries, updated in real time.',
    cta: 'Explore Data'
  }
];

type Severity = 'critical' | 'high' | 'medium';

interface Alert extends Post {
  severity: Severity;
  timestamp: string;
  country: string;
  countryCode: string;
}

const SEVERITIES: Severity[] = ['critical', 'high', 'high', 'medium', 'medium', 'medium'];
const TIMES = ['Just now', '2 min ago', '8 min ago', '15 min ago', '27 min ago', '41 min ago',
               '1 hr ago', '1 hr ago', '2 hrs ago', '2 hrs ago', '3 hrs ago', '4 hrs ago'];
const COUNTRIES: Array<{ name: string; code: string }> = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Germany',        code: 'DE' },
  { name: 'Japan',          code: 'JP' },
  { name: 'China',          code: 'CN' },
  { name: 'France',         code: 'FR' },
  { name: 'India',          code: 'IN' },
  { name: 'Brazil',         code: 'BR' },
  { name: 'Canada',         code: 'CA' },
  { name: 'Australia',      code: 'AU' },
  { name: 'South Korea',    code: 'KR' },
  { name: 'Singapore',      code: 'SG' },
];

const STORAGE_ACTIVE_COUNTRIES = 'mw.newsAlerts.activeCountries';
const STORAGE_ACTIVE_SEVERITIES = 'mw.newsAlerts.activeSeverities';
const SEVERITY_VALUES: Severity[] = ['critical', 'high', 'medium'];

function loadActiveCountries(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_COUNTRIES);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set(COUNTRIES.map(c => c.code));
  } catch {
    return new Set(COUNTRIES.map(c => c.code));
  }
}

function loadActiveSeverities(): Set<Severity> {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_SEVERITIES);
    if (!raw) return new Set(SEVERITY_VALUES);
    const parsed: string[] = JSON.parse(raw);
    const valid = parsed.filter((v): v is Severity => (SEVERITY_VALUES as string[]).includes(v));
    return valid.length ? new Set(valid) : new Set(SEVERITY_VALUES);
  } catch {
    return new Set(SEVERITY_VALUES);
  }
}

@Component({
  selector: 'app-news-alerts',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, AdSidebarComponent],
  templateUrl: './news-alerts.component.html',
  styleUrl: './news-alerts.component.scss'
})
export class NewsAlertsComponent implements OnInit {
  private title = inject(Title);
  private dataService = inject(DataService);

  loading = this.dataService.loading;
  error = this.dataService.error;

  readonly ads = NEWS_ADS;

  activeSeverities = signal<Set<Severity>>(loadActiveSeverities());

  readonly countries = COUNTRIES;

  activeCountries = signal<Set<string>>(loadActiveCountries());

  alerts = computed<Alert[]>(() =>
    this.dataService.posts().slice(0, 12).map((p, i) => ({
      ...p,
      severity:    SEVERITIES[i % SEVERITIES.length],
      timestamp:   TIMES[i % TIMES.length],
      country:     COUNTRIES[i % COUNTRIES.length].name,
      countryCode: COUNTRIES[i % COUNTRIES.length].code
    }))
  );

  filtered = computed(() => {
    const severities = this.activeSeverities();
    const countries = this.activeCountries();
    return this.alerts().filter(a =>
      severities.has(a.severity) && countries.has(a.countryCode)
    );
  });

  isAllActive = computed(() => this.activeSeverities().size === SEVERITY_VALUES.length);

  readonly filters: Array<{ value: Severity; label: string }> = [
    { value: 'critical', label: 'Critical' },
    { value: 'high',     label: 'High' },
    { value: 'medium',   label: 'Medium' }
  ];

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_ACTIVE_COUNTRIES, JSON.stringify([...this.activeCountries()]));
    });
    effect(() => {
      localStorage.setItem(STORAGE_ACTIVE_SEVERITIES, JSON.stringify([...this.activeSeverities()]));
    });
  }

  ngOnInit(): void {
    this.title.setTitle('News Alerts – MarketWatch');
    if (!this.dataService.posts().length) {
      this.dataService.fetchPosts().subscribe();
    }
  }

  selectAllSeverities(): void {
    this.activeSeverities.set(new Set(SEVERITY_VALUES));
  }

  toggleSeverity(s: Severity): void {
    this.activeSeverities.update(active => {
      const next = new Set(active);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  isSeverityActive(s: Severity): boolean {
    return this.activeSeverities().has(s);
  }

  countBySeverity(s: Severity): number {
    return this.alerts().filter(a => a.severity === s).length;
  }

  isCountryActive(code: string): boolean {
    return this.activeCountries().has(code);
  }

  isCountryDisabled(code: string): boolean {
    return this.countByCountry(code) === 0;
  }

  toggleCountry(code: string): void {
    if (this.isCountryDisabled(code)) return;
    this.activeCountries.update(active => {
      const next = new Set(active);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  countByCountry(code: string): number {
    const severities = this.activeSeverities();
    return this.alerts().filter(a => a.countryCode === code && severities.has(a.severity)).length;
  }
}
