import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/template.model';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authState = inject(AuthStateService);
  private apiUrl = `${environment.gatewayUrl}/auth`;
  private googleAuthUrl = `${environment.gatewayUrl}/auth`;

  // --- Registration Flow ---
  registerRequest(userData: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/register-request`, userData, { responseType: 'text' });
  }

  registerVerify(email: string, otp: string): Observable<AuthResponse> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register-user`, {}, { params }).pipe(
      tap((res) => {
        this.authState.setSession(res);
        this.authState.refreshCurrentUser().subscribe();
      })
    );
  }

  // --- Login Flow ---
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.authState.setSession(res);
        this.authState.refreshCurrentUser().subscribe();
      })
    );
  }

  // --- Forgot Password Flow ---
  forgotPasswordRequest(email: string): Observable<string> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.apiUrl}/forgot-password/request`, {}, { params, responseType: 'text' });
  }

  verifyForgotOtp(email: string, otp: string): Observable<string> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post(`${this.apiUrl}/forgot-password/verify`, {}, { params, responseType: 'text' });
  }

  resetPassword(email: string, newPassword: string): Observable<string> {
    const params = new HttpParams().set('email', email).set('newPassword', newPassword);
    return this.http.post(`${this.apiUrl}/forgot-password/reset`, {}, { params, responseType: 'text' });
  }

  logout() {
    this.authState.clearSession(false);
    this.router.navigate(['/auth']);
  }

  isLoggedIn(): boolean {
    return this.authState.isLoggedIn();
  }

  getToken(): string | null {
    return this.authState.getToken();
  }

  decodeToken() {
    return this.authState.decodeToken();
  }

  getRole(): string | null {
    return this.authState.getCurrentRole();
  }

  getSubscriptionPlan(): string {
    return this.authState.getSubscriptionPlan();
  }

  getUserId(): number | null {
    return this.authState.getCurrentUserId();
  }

  getEmail(): string | null {
    return this.authState.decodeToken()?.sub ?? null;
  }

  isAdmin(): boolean {
    return this.authState.isAdmin();
  }

  isTokenValid(): boolean {
    return this.authState.isTokenValid();
  }

  initiateGoogleLogin() {
    const clientId = `${environment.googleClientId}`;
    const redirectUri = `${environment.googleRedirectUri}`; // Points back to this component
    const scope = 'profile email';
    const responseType = 'code';

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=select_account`;

    window.location.href = url;
  }

  handleGoogleCallback(code: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.googleAuthUrl}/callback?code=${code}`).pipe(
      tap((res) => {
        this.authState.setSession(res);
        this.authState.refreshCurrentUser().subscribe();
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}).pipe(
      tap((res) => {
        this.authState.setSession(res);
        this.authState.refreshCurrentUser().subscribe();
      })
    );
  }
}
