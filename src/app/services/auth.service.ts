import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.gatewayUrl}/auth`;
  private googleAuthUrl = `${environment.gatewayUrl}/auth`;
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  // --- Registration Flow ---
  registerRequest(userData: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/register-request`, userData, { responseType: 'text' });
  }

  registerVerify(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post(`${this.apiUrl}/register-user`, {}, { params }).pipe(
      tap((res: any) => this.setToken(res.token))
    );
  }

  // --- Login Flow ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => this.setToken(res.token))
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

  private setToken(token: string) {
    if (token) localStorage.setItem('token', token);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  initiateGoogleLogin() {
    const clientId = `${environment.googleClientId}`;
    const redirectUri = `${environment.googleRedirectUri}`; // Points back to this component
    const scope = 'profile email';
    const responseType = 'code';

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=select_account`;

    window.location.href = url;
  }

  handleGoogleCallback(code: string): Observable<any> {
    return this.http.get(`${this.googleAuthUrl}/callback?code=${code}`).pipe(
      tap((res: any) => {
        if (res.token) localStorage.setItem('token', res.token);
      })
    );
  }

  // --- Profile Refresh ---
  refreshUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.gatewayUrl}/user/profile`).pipe(
      tap((profile: UserProfile) => {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        this.userProfileSubject.next(profile);
      })
    );
  }

  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  getUserProfileObservable(): Observable<UserProfile | null> {
    return this.userProfile$;
  }
}
