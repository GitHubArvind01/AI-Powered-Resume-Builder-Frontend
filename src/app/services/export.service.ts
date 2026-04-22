import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resume } from '../models/template.model';

export type ExportFormat = 'pdf' | 'docx' | 'txt';

export interface ExportRequest {
  resumeId: string;
  format: ExportFormat;
  template?: string;
}

export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/resume`;

  /**
   * Export resume to specified format
   */
  exportResume(resumeId: string, format: ExportFormat): Observable<ExportResponse> {
    const request = { resumeId, format };
    return this.http.post<ExportResponse>(`${this.apiUrl}/${resumeId}/export`, request);
  }

  /**
   * Export resume as PDF
   */
  exportAsPdf(resumeId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${resumeId}/export/pdf`, { responseType: 'blob' });
  }

  /**
   * Export resume as DOCX
   */
  exportAsDocx(resumeId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${resumeId}/export/docx`, { responseType: 'blob' });
  }

  /**
   * Export resume as plain text
   */
  exportAsText(resumeId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/${resumeId}/export/txt`, { responseType: 'text' });
  }

  /**
   * Download file from blob
   */
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

  /**
   * Generate file name for export
   */
  generateFileName(resumeTitle: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedTitle = resumeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const extension = format === 'docx' ? 'docx' : format;
    return `${sanitizedTitle}_${timestamp}.${extension}`;
  }

  /**
   * Export resume with client-side rendering (for preview)
   */
  generatePreviewHtml(resume: Resume, template?: string): string {
    // This generates HTML that can be rendered or printed
    const content = resume.content;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${resume.title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .resume-container {
              max-width: 8.5in;
              height: 11in;
              margin: 0 auto;
              padding: 40px;
              background-color: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #333;
              margin-bottom: 20px;
              padding-bottom: 10px;
            }
            .name {
              font-size: 28px;
              font-weight: bold;
              margin: 0;
            }
            .contact-info {
              font-size: 12px;
              color: #666;
              margin: 5px 0 0 0;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
              margin-top: 15px;
              margin-bottom: 8px;
              padding-bottom: 3px;
            }
            .section-content {
              font-size: 11px;
              margin-bottom: 10px;
            }
            .job-entry {
              margin-bottom: 10px;
            }
            .job-title {
              font-weight: bold;
            }
            .company-name {
              font-style: italic;
              color: #666;
            }
            .dates {
              color: #999;
              font-size: 10px;
            }
            ul {
              margin: 5px 0;
              padding-left: 20px;
            }
            li {
              margin: 3px 0;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <div class="header">
              <h1 class="name">${content.personalInfo?.fullName || 'Your Name'}</h1>
              <div class="contact-info">
                ${content.personalInfo?.email || ''} | ${content.personalInfo?.phone || ''} | ${content.personalInfo?.location || ''}
              </div>
            </div>

            ${content.summary ? `
              <div class="section">
                <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
                <div class="section-content">${content.summary}</div>
              </div>
            ` : ''}

            ${content.experience?.length ? `
              <div class="section">
                <h2 class="section-title">EXPERIENCE</h2>
                ${content.experience.map((job: any) => `
                  <div class="job-entry">
                    <div class="job-title">${job.jobTitle || ''}</div>
                    <div class="company-name">${job.companyName || ''}</div>
                    <div class="dates">${job.startDate || ''} - ${job.endDate || ''}</div>
                    <ul>
                      ${job.responsibilities?.map((resp: string) => `<li>${resp}</li>`).join('') || ''}
                    </ul>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${content.education?.length ? `
              <div class="section">
                <h2 class="section-title">EDUCATION</h2>
                ${content.education.map((edu: any) => `
                  <div class="job-entry">
                    <div class="job-title">${edu.degree || ''}</div>
                    <div class="company-name">${edu.school || ''}</div>
                    <div class="dates">${edu.graduationDate || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${content.skills?.length ? `
              <div class="section">
                <h2 class="section-title">SKILLS</h2>
                <div class="section-content">
                  ${content.skills.join(' • ')}
                </div>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;

    return html;
  }
}
