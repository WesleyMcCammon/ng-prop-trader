import { Component, inject, HostListener } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  modal = inject(ModalService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.modal.dismiss();
  }
}
