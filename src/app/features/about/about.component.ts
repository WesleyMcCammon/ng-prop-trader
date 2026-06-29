import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DataService, User } from '../../core/services/data.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private title = inject(Title);
  private dataService = inject(DataService);

  loading = this.dataService.loading;
  users = this.dataService.users;

  readonly values = [
    { icon: '🎯', label: 'Accuracy', desc: 'We verify every fact before publication.' },
    { icon: '⚡', label: 'Speed', desc: 'Breaking news delivered in real time.' },
    { icon: '🔍', label: 'Depth', desc: 'In-depth analysis beyond the headlines.' },
    { icon: '🌐', label: 'Global', desc: 'Correspondents in over 40 countries.' }
  ];

  ngOnInit(): void {
    this.title.setTitle('About – MarketWatch');
    this.dataService.fetchUsers().subscribe();
  }
}
