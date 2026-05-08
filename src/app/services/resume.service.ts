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
  keywordMatchPercentage?: number;
  suggestions: string[];
  overallFeedback?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

export interface ResumeBuilderContent {
  templateId: string;
  templateName?: string;
  templateType?: string;
  source?: 'TEMPLATE' | 'EDITOR' | string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    headline?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    link?: string;
  }>;
  certifications?: string[];
  languages?: string[];
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
    const content = {
      ...(data.content ?? this.createEmptyResumeContent(data.templateId)),
      templateId: data.templateId
    };
    const payload = {
      title: data.title,
      content: JSON.stringify(content),
      isPublic: false,
      status: 'DRAFT',
      description: `Resume created with ${data.templateId} template`
    };

    return this.http.post<BackendResumeResponse>(this.apiUrl, payload).pipe(
      map((resume) => this.mapResume(resume))
    );
  }

  updateResume(id: string, data: any): Observable<Resume> {
    const { title, content, ...rest } = data;
    const payloadContent = {
      ...(content ?? rest),
      templateId: data.templateId ?? content?.templateId ?? rest?.templateId ?? 'professional'
    };
    const payload = {
      title: title ?? 'My Resume',
      content: JSON.stringify(payloadContent),
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

  uploadResume(file: File): Observable<AtsCheckResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{
      score: number;
      keywordMatchPercentage?: number;
      suggestions?: string[];
      keywordsMatched?: string[];
      missingKeywords?: string[];
    }>(`${this.aiUrl}/ats-check`, formData).pipe(
      map((response) => ({
        score: response.score ?? 0,
        keywordMatchPercentage: response.keywordMatchPercentage ?? response.score ?? 0,
        suggestions: response.suggestions ?? [],
        matchedKeywords: response.keywordsMatched ?? [],
        missingKeywords: response.missingKeywords ?? []
      })),
      catchError((error) => {
        const message = error?.error?.message || error?.message || 'ATS analysis failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
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
        keywordMatchPercentage: response.totalKeywordsChecked
          ? Math.round(((response.keywordsMatched ?? 0) / response.totalKeywordsChecked) * 100)
          : response.atsScore ?? 0,
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
            keywordMatchPercentage: response.totalKeywordsChecked
              ? Math.round(((response.keywordsMatched ?? 0) / response.totalKeywordsChecked) * 100)
              : response.atsScore ?? 0,
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
      templateName: parsedContent.templateName,
      templateType: parsedContent.templateType,
      source: parsedContent.source,
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
      templateName: this.toTitleCase(templateId),
      templateType: templateId.toUpperCase(),
      source: 'EDITOR',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        headline: '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: '',
      experience: [
        {
          company: '',
          role: '',
          duration: '',
          highlights: ['']
        }
      ],
      education: [
        {
          institution: '',
          degree: '',
          year: ''
        }
      ],
      skills: [],
      projects: [
        {
          name: '',
          description: '',
          link: ''
        }
      ],
      certifications: [],
      languages: []
    } as ResumeBuilderContent;
  }

  // src/app/services/resume.service.ts

  public createFreshTemplateData(templateId: string): ResumeBuilderContent {
    return {
      templateId,
      templateName: this.toTitleCase(templateId),
      templateType: templateId.toUpperCase(),
      source: 'TEMPLATE',
      personalInfo: {
        fullName: 'Arvind Kumar', // Placeholder data
        email: 'arvind@example.com',
        phone: '+91 98765 43210',
        location: 'Bhopal, India',
        headline: 'Full Stack Java Developer',
        linkedin: 'linkedin.com/in/arvind-kumar',
        github: 'github.com/arvind',
        portfolio: 'arvind.dev'
      },
      summary: 'Experienced Full Stack Engineer with expertise in Spring Boot and Angular. Passionate about building scalable microservices and AI-driven applications.',
      experience: [
        {
          company: 'Tech Solutions Inc.',
          role: 'Senior Developer',
          duration: '2022 - Present',
          highlights: [
            'Led the migration of monolithic architecture to microservices[cite: 5].',
            'Integrated AI capabilities for automated data processing.'
          ]
        }
      ],
      education: [
        {
          institution: 'Technocrats Institute of Technology',
          degree: 'Bachelor of Technology',
          year: '2025'
        }
      ],
      skills: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
      projects: [
        {
          name: 'AI Resume Builder',
          description: 'A microservices-based platform for creating ATS-friendly resumes[cite: 5].',
          link: 'https://github.com/arvind/resume-ai'
        }
      ],
      certifications: ['AWS Certified Developer'],
      languages: ['English', 'Hindi']
    };
  }

  private toTitleCase(value: string): string {
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
