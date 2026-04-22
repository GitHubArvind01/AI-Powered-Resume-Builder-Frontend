import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Template, Resume } from '../models/template.model';
import { TemplateDataService } from './template-data.service';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private http = inject(HttpClient);
  private templateDataService = inject(TemplateDataService);
  private apiUrl = `${environment.gatewayUrl}/resume`;

  private templatesSubject = new BehaviorSubject<Template[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  private resumesSubject = new BehaviorSubject<Resume[]>([]);
  public resumes$ = this.resumesSubject.asObservable();

  constructor() {
    this.loadTemplates();
  }

  // Get all templates
  getTemplates(): Observable<Template[]> {
    return this.templateDataService.getAllTemplates();
  }

  loadTemplates(): void {
    this.getTemplates().subscribe(
      templates => this.templatesSubject.next(templates),
      error => {
        console.error('Error loading templates:', error);
        // Load default templates on error
        this.templateDataService.getAllTemplates().subscribe(
          templates => this.templatesSubject.next(templates)
        );
      }
    );
  }

  // Get user's resumes
  getUserResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.apiUrl}/user-resumes`);
  }

  // Create new resume
  createResume(data: { title: string; templateId: string }): Observable<Resume> {
    return this.http.post<Resume>(`${this.apiUrl}/create`, data);
  }

  // Update resume
  updateResume(id: string, data: any): Observable<Resume> {
    return this.http.put<Resume>(`${this.apiUrl}/${id}`, data);
  }

  // Delete resume
  deleteResume(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Upload resume
  uploadResume(file: File): Observable<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Resume>(`${this.apiUrl}/upload`, formData);
  }

  // ATS Check
  performAtsCheck(resumeId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${resumeId}/ats-check`, {});
  }
}
