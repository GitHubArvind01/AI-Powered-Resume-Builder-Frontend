import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Template } from '../models/template.model';
import { environment } from '../../environments/environment';

interface TemplateResponseDto {
  templateId: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class TemplateDataService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/templates`;

  getTemplates(): Observable<Template[]> {
    return this.getAllTemplates();
  }

  getTemplatesByCategory(category: string): Observable<Template[]> {
    if (category.toLowerCase() === 'all') {
      return this.getAllTemplates();
    }

    return this.http
      .get<TemplateResponseDto[]>(`${this.apiUrl}/category/${category.toUpperCase()}`)
      .pipe(map((templates) => templates.map((template) => this.mapTemplate(template))));
  }

  getFreeTemplates(): Observable<Template[]> {
    return this.http
      .get<TemplateResponseDto[]>(`${this.apiUrl}/free`)
      .pipe(map((templates) => templates.map((template) => this.mapTemplate(template))));
  }

  getAllTemplates(): Observable<Template[]> {
    return this.http
      .get<TemplateResponseDto[]>(this.apiUrl)
      .pipe(map((templates) => templates.map((template) => this.mapTemplate(template))));
  }

  getTemplateById(id: string): Observable<Template | undefined> {
    return this.http
      .get<TemplateResponseDto>(`${this.apiUrl}/${id}`)
      .pipe(map((template) => this.mapTemplate(template)));
  }

  private mapTemplate(template: TemplateResponseDto): Template {
    return {
      id: String(template.templateId),
      name: template.name,
      description: template.description,
      thumbnailUrl: template.thumbnailUrl,
      isPremium: template.isPremium,
      category: template.category
    };
  }
}
