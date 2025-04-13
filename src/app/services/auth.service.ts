import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  // Check if there's a stored auth token in localStorage
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('admin_token');
      if (token) {
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  login(username: string, password: string): Observable<boolean> {
    // Simple hardcoded auth for now - in a real app, this would call an API
    if (username === 'admin' && password === 'admin') {
      return of(true).pipe(
        delay(800), // Simulate network delay
        tap(() => {
          this.isAuthenticatedSubject.next(true);
          // Store a simple token in localStorage, but only in browser
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('admin_token', 'admin-token-' + Date.now());
          }
        })
      );
    } else {
      return of(false).pipe(delay(800));
    }
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}