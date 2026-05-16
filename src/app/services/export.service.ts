import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResumeBuilderContent } from './resume.service';

export type ExportFormat = 'pdf';
export type TemplateEditorMode = 'edit' | 'preview';

export interface TemplateSectionData {
  title: string;
  subtitle?: string;
  dateRange?: string;
  description?: string;
  location?: string;
  link?: string;
  bullets?: string[];
  metadata?: Record<string, string>;
}

export interface TemplateStyleConfig {
  variant: string;
  theme?: string;
  accentColor?: string;
  fontFamily?: string;
  compactSpacing?: boolean;
  singlePage?: boolean;
}

export interface TemplateExportRequest {
  templateId: string;
  templateName: string;
  editorMode: TemplateEditorMode;
  resumeData: TemplateResumePayload;
  styleConfig: TemplateStyleConfig;
}

export interface TemplateResumePayload {
  templateId: string;
  templateName?: string;
  templateType?: string;
  source?: string;
  personalInfo: ResumeBuilderContent['personalInfo'];
  summary: string;
  experience: TemplateSectionData[];
  education: TemplateSectionData[];
  skills: string[];
  projects: TemplateSectionData[];
  certifications?: string[];
  languages?: string[];
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/export`;

  exportAsPdf(resumeId: string): Observable<Blob> {
    const parsedResumeId = Number(resumeId);
    if (!Number.isFinite(parsedResumeId)) {
      return throwError(() => new Error('Please save the resume before exporting it as PDF.'));
    }

    return this.http.post(`${this.apiUrl}/pdf`, { resumeId: parsedResumeId }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/pdf'
      }),
      responseType: 'blob'
    });
  }

  exportTemplateAsPdf(request: TemplateExportRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/template/pdf`, request, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/pdf'
      }),
      responseType: 'blob'
    });
  }

  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateFileName(resumeTitle: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedTitle = resumeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitizedTitle}_${timestamp}.${format}`;
  }
}
