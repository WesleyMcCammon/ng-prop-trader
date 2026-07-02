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

  featured   = computed(() => this.posts().slice(0, 1));
  topStories = computed(() => this.posts().slice(1, 9));
  latest     = computed(() => this.posts().slice(9, 15));
  opinion    = computed(() => this.posts().slice(15, 18));

  pinnedInstruments = computed(() => {
    const symbols = this.pinService.pinnedSymbols();
    const items   = this.instrumentService.instruments().filter(i => symbols.has(i.symbol));
    return this.pinService.applyOrder(items).slice(0, 5);
  });

  readonly categories: Array<{ label: string; route?: string }> = [
    { label: 'Markets', route: '/market' },
    { label: 'Instruments', route: '/instruments' },    
    { label: 'News Alerts', route: '/news-alerts' },
    { label: 'Indicators', route: '/indicators' },
    // { label: 'Economy' },
    // { label: 'Finance' },
    // { label: 'World' },
    // { label: 'Politics' },
  ];

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