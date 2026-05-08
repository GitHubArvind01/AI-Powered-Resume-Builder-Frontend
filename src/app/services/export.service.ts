import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

  async exportElementToPdf(element: HTMLElement, fileName: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: Math.ceil(element.scrollWidth),
      windowHeight: Math.ceil(element.scrollHeight)
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Template preview export is single-page A4 by design, so we fit exactly one page
    // and avoid floating-point overflow that creates a blank trailing page.
    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    pdf.save(fileName);
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
