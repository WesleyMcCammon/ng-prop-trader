import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="spinner-overlay" [class.inline]="inline()">
        <div class="spinner-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        @if (label()) {
          <p class="spinner-label">{{ label() }}</p>
        }
      </div>
    }
  `,
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  visible = input(true);
  inline = input(false);
  label = input('');
}
