import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Post } from '../../core/services/data.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

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

@Component({
  selector: 'app-news-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './news-alerts.component.html',
  styleUrl: './news-alerts.component.scss'
})
export class NewsAlertsComponent implements OnInit {
  private title = inject(Title);
  private dataService = inject(DataService);

  loading = this.dataService.loading;
  error = this.dataService.error;

  filter = signal<Severity | 'all'>('all');

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
    const f = this.filter();
    return f === 'all' ? this.alerts() : this.alerts().filter(a => a.severity === f);
  });

  readonly filters: Array<{ value: Severity | 'all'; label: string }> = [
    { value: 'all',      label: 'All Alerts' },
    { value: 'critical', label: 'Critical' },
    { value: 'high',     label: 'High' },
    { value: 'medium',   label: 'Medium' }
  ];

  ngOnInit(): void {
    this.title.setTitle('News Alerts – MarketWatch');
    if (!this.dataService.posts().length) {
      this.dataService.fetchPosts().subscribe();
    }
  }

  setFilter(f: Severity | 'all'): void {
    this.filter.set(f);
  }

  countBySeverity(s: Severity | 'all'): number {
    return this.alerts().filter(a => a.severity === s).length;
  }
}
