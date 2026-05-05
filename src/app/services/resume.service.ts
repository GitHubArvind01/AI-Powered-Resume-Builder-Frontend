import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Template, Resume } from '../models/template.model';
import { TemplateDataService } from './template-data.service';
import { AuthStateService } from './auth-state.service';

interface BackendResumeResponse {
  id: number;
  userId: number;
  title: string;
  content: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  description?: string | null;
}

interface AtsBackendResponse {
  atsScore: number;
  improvements?: string[];
  missingKeywords?: string[];
  matchedKeywords?: string[];
  overallFeedback?: string;
  totalKeywordsChecked?: number;
  keywordsMatched?: number;
}

export interface AtsCheckResult {
  score: number;
  suggestions: string[];
  overallFeedback?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private http = inject(HttpClient);
  private templateDataService = inject(TemplateDataService);
  private authState = inject(AuthStateService);
  private apiUrl = `${environment.gatewayUrl}/resumes`;
  private aiUrl = `${environment.gatewayUrl}/ai`;

  private templatesSubject = new BehaviorSubject<Template[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  private resumesSubject = new BehaviorSubject<Resume[]>([]);
  public resumes$ = this.resumesSubject.asObservable();

  constructor() {
    this.loadTemplates();
  }

  getTemplates(): Observable<Template[]> {
    return this.templateDataService.getAllTemplates();
  }

  loadTemplates(): void {
    this.getTemplates().subscribe({
      next: (templates) => this.templatesSubject.next(templates),
      error: () => this.templateDataService.getAllTemplates().subscribe((templates) => this.templatesSubject.next(templates))
    });
  }

  getUserResumes(): Observable<Resume[]> {
    const userId = this.authState.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User session is not ready.'));
    }

    return this.http.get<BackendResumeResponse[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map((resumes) => resumes.map((resume) => this.mapResume(resume))),
      map((resumes) => {
        this.resumesSubject.next(resumes);
        return resumes;
      })
    );
  }

  getResumeById(id: string): Observable<Resume> {
    return this.http.get<BackendResumeResponse>(`${this.apiUrl}/${id}`).pipe(
      map((resume) => this.mapResume(resume))
    );
  }

  createResume(data: { title: string; templateId: string; content?: any }): Observable<Resume> {
    const payload = {
      title: data.title,
      content: JSON.stringify(data.content ?? this.createEmptyResumeContent(data.templateId)),
      isPublic: false,
      status: 'DRAFT',
      description: `Resume created with ${data.templateId} template`
    };

    return this.http.post<BackendResumeResponse>(this.apiUrl, payload).pipe(
      map((resume) => this.mapResume(resume))
    );
  }

  updateResume(id: string, data: any): Observable<Resume> {
    const { title, ...content } = data;
    const payload = {
      title: title ?? 'My Resume',
      content: JSON.stringify(content),
      isPublic: false,
      status: 'DRAFT',
      description: 'Updated from editor'
    };

    return this.http.put<BackendResumeResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((resume) => this.mapResume(resume))
    );
  }

  deleteResume(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  saveResumeContent(templateId: string, content: string): Observable<Resume> {
    const payload = {
      title: 'Edited Resume',
      content: JSON.stringify({ templateId, htmlContent: content }),
      isPublic: false,
      status: 'DRAFT',
      description: 'Saved from inline editor'
    };

    return this.http.post<BackendResumeResponse>(this.apiUrl, payload).pipe(
      map((resume) => this.mapResume(resume))
    );
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post('/api/ai/ats-check', formData);
  }

  performAtsCheckFromUpload(file: File, jobDescription: string = ''): Observable<AtsCheckResult> {
    const userId = this.authState.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User session is not ready.'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);

    return this.http.post<AtsBackendResponse>(`${this.aiUrl}/check-ats/upload`, formData, {
      headers: { 'X-User-Id': userId.toString() }
    }).pipe(
      map((response) => ({
        score: response.atsScore ?? 0,
        suggestions: this.buildAtsSuggestions(response),
        overallFeedback: response.overallFeedback,
        matchedKeywords: response.matchedKeywords ?? [],
        missingKeywords: response.missingKeywords ?? []
      })),
      catchError((error) => {
        const message = error?.error?.message || error?.message || 'ATS analysis failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  performAtsCheck(resumeId: string, jobDescription: string = ''): Observable<any> {
    const parsedResumeId = Number(resumeId);
    if (!Number.isFinite(parsedResumeId)) {
      return throwError(() => new Error('Please save the resume before running an ATS check.'));
    }

    return this.getResumeById(resumeId).pipe(
      switchMap((resume) => {
        const userId = this.authState.getCurrentUserId();
        if (!userId) {
          return throwError(() => new Error('User session is not ready.'));
        }

        return this.http.post<AtsBackendResponse>(`${this.aiUrl}/check-ats`, {
          userId,
          resumeId: parsedResumeId,
          resumeContent: JSON.stringify(resume.content),
          jobDescription
        }).pipe(
          map((response) => ({
            score: response.atsScore ?? 0,
            suggestions: this.buildAtsSuggestions(response),
            overallFeedback: response.overallFeedback,
            matchedKeywords: response.matchedKeywords ?? [],
            missingKeywords: response.missingKeywords ?? []
          })),
          catchError((error) => {
            const message = error?.error?.message || error?.message || 'ATS analysis failed. Please try again.';
            return throwError(() => new Error(message));
          })
        );
      }),
      catchError((error) => {
        const message = error?.error?.message || error?.message || 'Unable to load resume for ATS analysis.';
        return throwError(() => new Error(message));
      })
    );
  }

  private buildAtsSuggestions(response: AtsBackendResponse): string[] {
    const suggestions = [
      ...(response.improvements ?? []),
      ...((response.missingKeywords ?? []).slice(0, 5).map((keyword) => `Add keyword: ${keyword}`))
    ].filter((value, index, array) => !!value && array.indexOf(value) === index);

    if (!suggestions.length && response.overallFeedback) {
      suggestions.push(response.overallFeedback);
    }

    return suggestions.length ? suggestions : ['Resume looks ATS-ready.'];
  }

  private mapResume(resume: BackendResumeResponse): Resume {
    const parsedContent = this.parseResumeContent(resume.content);
    return {
      id: String(resume.id),
      title: resume.title,
      templateId: parsedContent.templateId || 'professional',
      content: parsedContent,
      createdAt: new Date(resume.createdAt),
      updatedAt: new Date(resume.updatedAt)
    };
  }

  private parseResumeContent(content: string | null): any {
    if (!content) {
      return this.createEmptyResumeContent('professional');
    }

    try {
      return JSON.parse(content);
    } catch {
      return {
        ...this.createEmptyResumeContent('professional'),
        summary: content
      };
    }
  }

  private createEmptyResumeContent(templateId: string): any {
    return {
      templateId,
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: []
    };
  }
}
