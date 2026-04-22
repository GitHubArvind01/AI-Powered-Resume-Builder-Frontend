import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { UserPlan } from '../models/template.model';

export interface AiImprovementRequest {
  text: string;
  type: 'summary' | 'bullets' | 'job-description' | 'skills' | 'general';
  context?: string;
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
  private userService = inject(UserService);
  private apiUrl = `${environment.gatewayUrl}/ai`;

  // Track AI usage for free users (limit: 5 improvements per day)
  private aiUsageSubject = new BehaviorSubject<number>(0);
  public aiUsage$ = this.aiUsageSubject.asObservable();

  private readonly FREE_USER_DAILY_LIMIT = 5;
  private readonly PRO_USER_DAILY_LIMIT = 50;

  constructor() {
    this.loadAiUsage();
  }

  /**
   * Improve resume content using AI
   */
  improveContent(request: AiImprovementRequest): Observable<AiImprovementResponse> {
    return this.http.post<AiImprovementResponse>(`${this.apiUrl}/improve`, request);
  }

  /**
   * Generate resume summary from content
   */
  generateSummary(content: string, jobTitle?: string): Observable<{ summary: string }> {
    const request = {
      content,
      jobTitle,
      type: 'summary'
    };
    return this.http.post<{ summary: string }>(`${this.apiUrl}/generate-summary`, request);
  }

  /**
   * Generate bullet points from text
   */
  generateBulletPoints(text: string): Observable<{ bullets: string[] }> {
    const request = {
      text,
      type: 'bullets'
    };
    return this.http.post<{ bullets: string[] }>(`${this.apiUrl}/generate-bullets`, request);
  }

  /**
   * Enhance job description to match resume
   */
  enhanceJobDescription(jobDescription: string, resumeContent?: string): Observable<{ enhanced: string }> {
    const request = {
      jobDescription,
      resumeContent,
      type: 'job-description'
    };
    return this.http.post<{ enhanced: string }>(`${this.apiUrl}/enhance-job-description`, request);
  }

  /**
   * Check if user can use AI features
   */
  canUseAiFeatures(): boolean {
    const profile = this.userService.getCurrentProfile();
    if (!profile) return false;

    const currentPlan = this.userService.getCurrentPlan();
    const usage = this.aiUsageSubject.value;

    if (currentPlan === UserPlan.PRO) {
      return usage < this.PRO_USER_DAILY_LIMIT;
    }
    return usage < this.FREE_USER_DAILY_LIMIT;
  }

  /**
   * Get remaining AI improvements for today
   */
  getRemainingImprovements(): number {
    const currentPlan = this.userService.getCurrentPlan();
    const usage = this.aiUsageSubject.value;

    const limit = currentPlan === UserPlan.PRO ? this.PRO_USER_DAILY_LIMIT : this.FREE_USER_DAILY_LIMIT;
    return Math.max(0, limit - usage);
  }

  /**
   * Load AI usage from backend
   */
  private loadAiUsage(): void {
    this.http.get<{ usage: number }>(`${this.apiUrl}/usage`).subscribe(
      result => this.aiUsageSubject.next(result.usage),
      error => {
        console.error('Error loading AI usage:', error);
        this.aiUsageSubject.next(0);
      }
    );
  }

  /**
   * Increment AI usage counter
   */
  incrementUsage(): void {
    const current = this.aiUsageSubject.value;
    this.aiUsageSubject.next(current + 1);
  }

  /**
   * Reset AI usage (for testing)
   */
  resetUsage(): void {
    this.aiUsageSubject.next(0);
  }
}
