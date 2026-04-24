import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, UserPlan, UserProfile } from '../models/template.model';

// Detect if the user has just returned from a PayPal redirect.
// PayPal appends query params like ?paymentId=... or ?token=...
function isPaymentReturnUrl(): boolean {
  const search = window.location.search;
  return (
    window.location.pathname.includes('payment-success') ||
    window.location.pathname.includes('payment-failed') ||
    search.includes('paymentId') ||
    search.includes('token')
  );
}

interface AuthMeta {
  role: string | null;
  subscriptionPlan: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenKey = 'token';
  private readonly metaKey = 'auth_meta';
  private readonly userKey = 'auth_user';
  private readonly userApiUrl = `${environment.gatewayUrl}/users`;

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenKey));
  readonly token$ = this.tokenSubject.asObservable();

  private authMetaSubject = new BehaviorSubject<AuthMeta>(this.readStoredMeta());
  readonly authMeta$ = this.authMetaSubject.asObservable();

  private userSubject = new BehaviorSubject<UserProfile | null>(this.readStoredUser());
  readonly user$ = this.userSubject.asObservable();

  initialize(): Observable<UserProfile | null> {
    if (!this.getToken()) {
      // No token at all — clear any stale meta and stay on current page
      this.clearSession(false);
      return of(null);
    }

    // If the user just returned from a PayPal redirect, skip the /me call
    // during initialization. PaymentSuccessComponent will call /me itself
    // after verifying the payment, so we don't risk a race-condition logout.
    if (isPaymentReturnUrl()) {
      return of(null);
    }

    return this.refreshCurrentUser().pipe(
      catchError(() => {
        // /me failed but we still have a token — do NOT clear session.
        // The token may be perfectly valid; /me could fail due to a cold-start
        // latency spike or a transient network error. Clearing here is what
        // was logging users out after payment.
        return of(null);
      })
    );
  }

  setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);

    const authMeta: AuthMeta = {
      role: response.role ?? null,
      subscriptionPlan: response.subscriptionPlan ?? 'FREE'
    };

    localStorage.setItem(this.metaKey, JSON.stringify(authMeta));
    this.tokenSubject.next(response.token);
    this.authMetaSubject.next(authMeta);
  }

  refreshCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userApiUrl}/me`).pipe(
      tap((user) => {
        this.userSubject.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.authMetaSubject.next({
          role: user.role,
          subscriptionPlan: user.subscriptionPlan
        });
        localStorage.setItem(this.metaKey, JSON.stringify(this.authMetaSubject.value));
      })
    );
  }

  clearSession(redirectToAuth: boolean = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.metaKey);
    localStorage.removeItem(this.userKey);
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.authMetaSubject.next({ role: null, subscriptionPlan: null });

    if (redirectToAuth) {
      this.router.navigate(['/auth']);
    }
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  getCurrentUserId(): number | null {
    const userId = this.userSubject.value?.id;
    if (userId) {
      return userId;
    }

    return this.decodeUserIdFromToken(this.getToken());
  }

  getCurrentRole(): string | null {
    return this.userSubject.value?.role ?? this.authMetaSubject.value.role;
  }

  getSubscriptionPlan(): string {
    return (this.userSubject.value?.subscriptionPlan ?? this.authMetaSubject.value.subscriptionPlan ?? 'FREE').toUpperCase();
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

  private readStoredMeta(): AuthMeta {
    const rawMeta = localStorage.getItem(this.metaKey);
    if (!rawMeta) {
      return { role: null, subscriptionPlan: null };
    }

    try {
      return JSON.parse(rawMeta) as AuthMeta;
    } catch {
      return { role: null, subscriptionPlan: null };
    }
  }

  private readStoredUser(): UserProfile | null {
    const rawUser = localStorage.getItem(this.userKey);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as UserProfile;
    } catch {
      return null;
    }
  }

  private decodeUserIdFromToken(token: string | null): number | null {
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.userId ? Number(payload.userId) : null;
    } catch {
      return null;
    }
  }
}
