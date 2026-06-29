import { Component, inject, OnInit, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Post } from '../../core/services/data.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private title = inject(Title);
  private dataService = inject(DataService);

  loading = this.dataService.loading;
  error = this.dataService.error;
  posts = this.dataService.posts;

  featured = computed(() => this.posts().slice(0, 1));
  topStories = computed(() => this.posts().slice(1, 9));
  latest = computed(() => this.posts().slice(9, 15));
  opinion = computed(() => this.posts().slice(15, 18));

  readonly categories: Array<{ label: string; route?: string }> = [
    { label: 'Markets' },
    { label: 'Tech' },
    { label: 'Economy' },
    { label: 'Finance' },
    { label: 'World' },
    { label: 'Politics' },
    { label: 'News Alerts', route: '/news-alerts' }
  ];

  ngOnInit(): void {
    this.title.setTitle('MarketWatch – Home');
    this.dataService.fetchPosts().subscribe();
  }

  trackByPostId(_: number, post: Post): number {
    return post.id;
  }

  excerpt(body: string, length = 120): string {
    return body.length > length ? body.slice(0, length) + '…' : body;
  }
}
