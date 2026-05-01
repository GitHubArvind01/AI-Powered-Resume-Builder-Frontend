import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type ExportFormat = 'pdf';

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
