import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private title = inject(Title);
  private fb = inject(FormBuilder);

  submitted = signal(false);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    this.title.setTitle('Contact – MarketWatch');
  }

  get name()    { return this.form.get('name')!; }
  get email()   { return this.form.get('email')!; }
  get subject() { return this.form.get('subject')!; }
  get message() { return this.form.get('message')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Contact form submitted:', this.form.value);
    this.submitted.set(true);
    this.form.reset();
  }

  reset(): void {
    this.submitted.set(false);
  }
}
