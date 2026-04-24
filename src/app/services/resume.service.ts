import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
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

  uploadResume(file: File): Observable<Resume> {
    return throwError(() => new Error(`Upload for "${file.name}" is not implemented by the current backend.`));
  }

  performAtsCheck(resumeId: string, jobDescription: string = ''): Observable<any> {
    return this.getResumeById(resumeId).pipe(
      switchMap((resume) => {
        const userId = this.authState.getCurrentUserId();
        if (!userId) {
          return throwError(() => new Error('User session is not ready.'));
        }

        return this.http.post(`${this.aiUrl}/check-ats`, {
          userId,
          resumeId: Number(resumeId),
          resumeContent: JSON.stringify(resume.content),
          jobDescription
        });
      })
    );
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
