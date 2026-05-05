import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthStateService } from './auth-state.service';

export interface AiImprovementRequest {
  text: string;
  type: 'summary' | 'bullets' | 'job-description' | 'skills' | 'general';
  action?: 'generate' | 'improve';
  context?: string;
  resumeId?: string | number | null;
}

export interface AiImprovementResponse {
  originalText: string;
  improvedText: string;
  suggestions: string[];
  confidence: number;
  remainingUsage: number;
  limitReached: boolean;
}

export interface AiUsageSummary {
  usage: number;
  remaining: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private authState = inject(AuthStateService);
  private apiUrl = `${environment.gatewayUrl}/ai`;

  private aiUsageSubject = new BehaviorSubject<AiUsageSummary>({ usage: 0, remaining: 5, total: 5 });
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
      action: request.action ?? 'improve',
      context: request.context
    });
  }

  refreshUsage(): void {
    const userId = this.authState.getCurrentUserId();
    if (!userId) {
      this.aiUsageSubject.next({ usage: 0, remaining: 5, total: 5 });
      return;
    }

    this.http.get<AiUsageSummary>(`${this.apiUrl}/usage/${userId}`).pipe(
      catchError(() => of({ usage: 0, remaining: 5, total: 5 }))
    ).subscribe((result) => this.aiUsageSubject.next(result));
  }

  canUseAiFeatures(): boolean {
    return this.authState.isProUser() || this.getRemainingImprovements() > 0;
  }

  getRemainingImprovements(): number {
    if (this.authState.isProUser()) {
      return 999;
    }

    return Math.max(0, this.aiUsageSubject.value.remaining);
  }

  incrementUsage(): void {
    const current = this.aiUsageSubject.value;

    this.aiUsageSubject.next({
      ...current,
      usage: current.usage + 1,
      remaining: Math.max(0, current.remaining - 1)
    });
  }

  syncUsage(remainingUsage: number): void {
    const current = this.aiUsageSubject.value;
    this.aiUsageSubject.next({
      ...current,
      usage: Math.max(0, current.total - remainingUsage),
      remaining: remainingUsage
    });
  }
}
