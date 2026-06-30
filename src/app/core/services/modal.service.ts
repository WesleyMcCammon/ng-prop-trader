import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly config = signal<ModalConfig | null>(null);

  show(title: string, message: string): void {
    this.config.set({ title, message });
  }

  dismiss(): void {
    this.config.set(null);
  }
}
