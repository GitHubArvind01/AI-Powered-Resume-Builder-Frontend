import { Injectable, inject } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserPlan, UserProfile } from '../models/template.model';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private authState = inject(AuthStateService);

  public userProfile$ = this.authState.user$;
  public userPlan$ = merge(this.authState.user$, this.authState.token$).pipe(
    map(() => this.authState.getCurrentPlan())
  );

  getUserProfile(): Observable<UserProfile> {
    return this.authState.refreshCurrentUser();
  }

  loadUserProfile(): void {
    this.authState.refreshCurrentUser().subscribe();
  }

  getCurrentPlan(): UserPlan {
    return this.authState.getCurrentPlan();
  }

  isPremium(): boolean {
    return this.authState.isProUser();
  }

  getCurrentProfile(): UserProfile | null {
    return this.authState.getCurrentUser();
  }

  isProUser(): boolean {
    return this.authState.isProUser();
  }

  isFreeUser(): boolean {
    return this.authState.isFreeUser();
  }
}
