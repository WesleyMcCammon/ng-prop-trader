import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  readonly posts = signal<Post[]>([]);
  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchPosts(): Observable<Post[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Post[]>(`${environment.apiUrl}/posts`).pipe(
      tap(posts => {
        this.posts.set(posts);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to load posts.');
        this.loading.set(false);
        return of([]);
      })
    );
  }

  fetchUsers(): Observable<User[]> {
    this.loading.set(true);
    return this.http.get<User[]>(`${environment.apiUrl}/users`).pipe(
      tap(users => {
        this.users.set(users);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }
}
