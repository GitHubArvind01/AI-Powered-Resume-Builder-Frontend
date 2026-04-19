import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile, UserPlan } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/user`;

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  private userPlanSubject = new BehaviorSubject<UserPlan>(UserPlan.FREE);
  public userPlan$ = this.userPlanSubject.asObservable();

  constructor() {
    this.loadUserProfile();
  }

  // Get user profile
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  loadUserProfile(): void {
    this.getUserProfile().subscribe(
      profile => {
        this.userProfileSubject.next(profile);
        const plan = profile.isPremium ? UserPlan.PRO : UserPlan.FREE;
        this.userPlanSubject.next(plan);
      },
      error => console.error('Error loading user profile:', error)
    );
  }

  // Update user profile
  updateUserProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, data).pipe(
      tap(profile => {
        this.userProfileSubject.next(profile);
        const plan = profile.isPremium ? UserPlan.PRO : UserPlan.FREE;
        this.userPlanSubject.next(plan);
      })
    );
  }

  // Upgrade to premium
  upgradeToPremium(): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/upgrade-premium`, {}).pipe(
      tap(profile => {
        this.userProfileSubject.next(profile);
        this.userPlanSubject.next(UserPlan.PRO);
      })
    );
  }

  // Get current user plan
  getCurrentPlan(): UserPlan {
    return this.userPlanSubject.value;
  }

  // Check if user is premium
  isPremium(): boolean {
    return this.getCurrentPlan() === UserPlan.PRO;
  }

  // Get current user profile
  getCurrentProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }
}
