import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, JwtPayload, UserPlan, UserProfile } from '../models/template.model';

function isPaymentReturnUrl(): boolean {
  const search = window.location.search;
  return (
    window.location.pathname.includes('payment-success') ||
    window.location.pathname.includes('payment-failed') ||
    search.includes('paymentId') ||
    search.includes('token')
  );
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenKey = 'token';
  private readonly userApiUrl = `${environment.gatewayUrl}/users`;

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenKey));
  readonly token$ = this.tokenSubject.asObservable();

  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly user$ = this.userSubject.asObservable();

  initialize(): Observable<UserProfile | null> {
    if (!this.isLoggedIn()) {
      this.clearSession(false);
      return of(null);
    }

    if (isPaymentReturnUrl()) {
      return of(null);
    }

    return this.refreshCurrentUser().pipe(
      catchError(() => of(null))
    );
  }

  setSession(response: AuthResponse): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.setItem(this.tokenKey, response.token);
    this.tokenSubject.next(response.token);
  }

  refreshCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userApiUrl}/me`).pipe(
      tap((user) => {
        if (!user.active) {
          this.clearSession();
          throw new Error('Your account has been deactivated.');
        }

        this.userSubject.next(user);
      })
    );
  }

  clearSession(redirectToAuth: boolean = true): void {
    localStorage.removeItem(this.tokenKey);
    this.tokenSubject.next(null);
    this.userSubject.next(null);

    if (redirectToAuth) {
      this.router.navigate(['/auth']);
    }
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  decodeToken(token: string | null = this.getToken()): JwtPayload | null {
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
      const decoded = decodeURIComponent(
        window
          .atob(padded)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );

      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenValid(token: string | null = this.getToken()): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && this.isTokenValid();
  }

  getCurrentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  getCurrentUserId(): number | null {
    return this.userSubject.value?.id ?? (this.decodeToken()?.userId ? Number(this.decodeToken()?.userId) : null);
  }

  getCurrentRole(): string | null {
    return this.decodeToken()?.role ?? null;
  }

  getSubscriptionPlan(): string {
    return (this.decodeToken()?.subscriptionPlan ?? 'FREE').toUpperCase();
  }

  getCurrentPlan(): UserPlan {
    return this.isProUser() ? UserPlan.PRO : UserPlan.FREE;
  }

  isProUser(): boolean {
    return ['PRO', 'MONTHLY', 'YEARLY'].includes(this.getSubscriptionPlan());
  }

  isFreeUser(): boolean {
    return !this.isProUser();
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'ADMIN';
  }
}
