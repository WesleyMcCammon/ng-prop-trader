import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Post } from '../../core/services/data.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { InstrumentService } from '../../core/services/instrument.service';
import { PinService } from '../../core/services/pin.service';
import { PriceFeedService } from '../../core/services/price-feed.service';
import { InstrumentCardComponent } from '../../shared/components/instrument-card/instrument-card.component';
import { MockAd } from '../../shared/model/ad.model';

const MOCK_ADS: MockAd[] = [
  {
    sponsor: 'FundedNext',
    headline: 'Get Funded up to $200K',
    body: 'Pass our challenge and trade with our capital. No risk to your own funds.',
    cta: 'Start Challenge'
  },
  {
    sponsor: 'TradingView',
    headline: 'Chart Like a Pro',
    body: 'Advanced charting tools trusted by millions of traders worldwide.',
    cta: 'Try Free'
  },
  {
    sponsor: 'Apex Capital',
    headline: '90% Profit Split',
    body: 'Keep more of what you earn with our industry-leading payout structure.',
    cta: 'Learn More'
  }
];

const MOCK_STRIP_ADS: MockAd[] = [
  {
    sponsor: 'Topstep',
    headline: 'Trade Our Money',
    body: 'Earn a funded futures account by proving your strategy in our trading combine.',
    cta: 'Get Started'
  },
  {
    sponsor: 'Interactive Brokers',
    headline: 'Low-Cost Global Access',
    body: 'Trade stocks, options, and futures across 150 markets from one account.',
    cta: 'Open Account'
  },
  {
    sponsor: 'MetaTrader 5',
    headline: 'Multi-Asset Trading Platform',
    body: 'Advanced order types and one-click trading for forex, stocks, and futures.',
    cta: 'Download'
  }
];

const MOCK_BANNER_ADS: MockAd[] = [
  {
    sponsor: 'NinjaTrader',
    headline: 'Free Trading Simulator',
    body: 'Practice risk-free with real-time market data before you trade live.',
    cta: 'Download Free'
  },
  {
    sponsor: 'TraderSync',
    headline: 'Know Your Edge',
    body: 'Automated trade journaling and analytics that show you what actually works.',
    cta: 'Start Trial'
  },
  {
    sponsor: 'Velocity VPS',
    headline: '99.9% Uptime for Your Bots',
    body: 'Ultra-low latency hosting built for algorithmic traders. 1ms to major exchanges.',
    cta: 'Get Hosting'
  }
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, InstrumentCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private title           = inject(Title);
  private dataService     = inject(DataService);
  private instrumentService = inject(InstrumentService);
  private pinService      = inject(PinService);
  private priceFeed       = inject(PriceFeedService);

  loading    = this.dataService.loading;
  error      = this.dataService.error;
  posts      = this.dataService.posts;

  featured = computed(() => this.posts().slice(0, 1));

  pinnedInstruments = computed(() => {
    const symbols = this.pinService.pinnedSymbols();
    const items   = this.instrumentService.instruments().filter(i => symbols.has(i.symbol));
    return this.pinService.applyOrder(items).slice(0, 4);
  });

  fillerStories = computed(() => {
    const pinned = this.pinnedInstruments().length;
    if (pinned === 0) return [];
    const needed = Math.max(0, 4 - pinned);
    return this.posts().slice(1, 1 + needed);
  });

  topStories = computed(() => {
    const offset = this.fillerStories().length;
    return this.posts().slice(1 + offset, 9);
  });

  latest = computed(() => this.posts().slice(9, 15));

  readonly ads = MOCK_ADS;
  readonly bannerAds = MOCK_BANNER_ADS;
  readonly stripAds = MOCK_STRIP_ADS;


  ngOnInit(): void {
    this.title.setTitle('MarketWatch – Home');
    this.dataService.fetchPosts().subscribe();
    this.priceFeed.start();
  }

  ngOnDestroy(): void {
    this.priceFeed.stop();
  }

  trackByPostId(_: number, post: Post): number {
    return post.id;
  }

  excerpt(body: string, length = 120): string {
    return body.length > length ? body.slice(0, length) + '…' : body;
  }
}