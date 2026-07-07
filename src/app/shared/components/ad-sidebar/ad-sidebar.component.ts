import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockAd } from '../../model/ad.model';

@Component({
  selector: 'app-ad-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-sidebar.component.html',
  styleUrl: './ad-sidebar.component.scss'
})
export class AdSidebarComponent {
  ads = input.required<MockAd[]>();
  title = input('Sponsored');
}
