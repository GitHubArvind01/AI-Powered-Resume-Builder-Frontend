import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthStateService } from './auth-state.service';

export interface AiImprovementRequest {
  text: string;
  type: 'summary' | 'bullets' | 'job-description' | 'skills' | 'general';
  context?: string;
  resumeId?: string | number | null;
}

export interface AiImprovementResponse {
  originalText: string;
  improvedText: string;
  suggestions: string[];
  confidence: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private apiUrl = `${environment.gatewayUrl}/ai`;

  private aiUsageSubject = new BehaviorSubject<number>(0);
  public aiUsage$ = this.aiUsageSubject.asObservable();

  constructor() {
    this.refreshUsage();
  }

  improveContent(request: AiImprovementRequest): Observable<AiImprovementResponse> {
    const userId = this.authState.getCurrentUserId();
    if (!userId) {
      throw new Error('User session is not ready.');
    }

    return this.http.post<AiImprovementResponse>(`${this.apiUrl}/improve`, {
      userId,
      resumeId: request.resumeId ? Number(request.resumeId) : null,
      text: request.text,
      type: request.type,
      context: request.context
    });
  }

  refreshUsage(): void {
    const userId = this.authState.getCurrentUserId();
    if (!userId) {
      this.aiUsageSubject.next(0);
      return;
    }

    this.http.get<{ usage: number }>(`${this.apiUrl}/usage/${userId}`).pipe(
      catchError(() => of({ usage: 0 }))
    ).subscribe((result) => this.aiUsageSubject.next(result.usage));
  }

  canUseAiFeatures(): boolean {
    return this.authState.isProUser() || this.getRemainingImprovements() > 0;
  }

  getRemainingImprovements(): number {
    if (this.authState.isProUser()) {
      return 999;
    }

    const freeLimit = 5;
    return Math.max(0, freeLimit - this.aiUsageSubject.value);
  }

  incrementUsage(): void {
    const current = this.aiUsageSubject.value;
    this.aiUsageSubject.next(current + 1);
  }
}
