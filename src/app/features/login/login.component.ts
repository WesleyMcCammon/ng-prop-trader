import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = signal<string | null>(null);

  submit(): void {
    this.error.set(null);
    const success = this.auth.login(this.username.trim(), this.password);
    if (success) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Invalid username or password.');
    }
  }
}
