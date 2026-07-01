import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'admin' | 'forex' | 'futures';

export interface MockUser {
  id: number;
  name: string;
  username: string;
  password: string;
  roles: UserRole[];
}

export const MOCK_USERS: MockUser[] = [
  { id: 1, name: 'Alice Admin',        username: 'alice',   password: 'pass', roles: ['admin'] },
  { id: 2, name: 'Frank Forex',        username: 'frank',   password: 'pass', roles: ['forex'] },
  { id: 3, name: 'Fiona Futures',      username: 'fiona',   password: 'pass', roles: ['futures'] },
  { id: 4, name: 'Bob Both',           username: 'bob',     password: 'pass', roles: ['forex', 'futures'] },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<MockUser | null>(null);

  readonly isAdmin   = computed(() => this.currentUser()?.roles.includes('admin')   ?? false);
  readonly isForex   = computed(() => this.currentUser()?.roles.includes('forex')   ?? false);
  readonly isFutures = computed(() => this.currentUser()?.roles.includes('futures') ?? false);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);


  // remove constructor
  constructor() {
    const user = MOCK_USERS.find(u => u.username === 'alice');
    if(user)
      this.currentUser.set(user);
  }

  login(username: string, password: string): boolean {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  loginAs(user: MockUser): void {
    this.currentUser.set(user);
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
