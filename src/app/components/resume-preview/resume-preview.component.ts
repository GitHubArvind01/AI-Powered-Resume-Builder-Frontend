import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService, ResumeBuilderContent } from '../../services/resume.service';
import { ExportService, TemplateEditorMode, TemplateExportRequest } from '../../services/export.service';
import { AtsCheckerComponent } from '../ats-checker/ats-checker.component';
import { MinimalistResumeTemplateComponent } from '../resume-templates/minimalist-resume-template.component';
import { ModernResumeTemplateComponent } from '../resume-templates/modern-resume-template.component';
import { ProfessionalResumeTemplateComponent } from '../resume-templates/professional-resume-template.component';
import { CreativeResumeTemplateComponent } from '../resume-templates/creative-resume-template.component';
import { ExecutiveResumeTemplateComponent } from '../resume-templates/executive-resume-template.component';
import { AiService } from '../../services/ai.service';

const TEMPLATE_COMPONENT_MAP = {
  minimalist: MinimalistResumeTemplateComponent,
  modern: ModernResumeTemplateComponent,
  professional: ProfessionalResumeTemplateComponent,
  creative: CreativeResumeTemplateComponent,
  executive: ExecutiveResumeTemplateComponent
} as const;

@Component({
  selector: 'app-resume-preview',
  standalone: true,
  imports: [
    CommonModule,
    AtsCheckerComponent,
    MinimalistResumeTemplateComponent,
    ModernResumeTemplateComponent,
    ProfessionalResumeTemplateComponent,
    CreativeResumeTemplateComponent,
    ExecutiveResumeTemplateComponent
  ],
  templateUrl: './resume-preview.component.html',
  styleUrl: './resume-preview.component.css'
})
export class ResumePreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private resumeService = inject(ResumeService);
  private exportService = inject(ExportService);
  private router = inject(Router);
  private aiService = inject(AiService);

  readonly templateComponentMap = TEMPLATE_COMPONENT_MAP;

  resume!: ResumeBuilderContent;
  currentResumeId = '';
  templateId = 'modern';
  templateName = 'Modern';
  templateCategory = 'MODERN';
  isLoading = true;
  isSaving = false;
  isExporting = false;
  showAtsDrawer = false;
  isImprovingSummary = false;
  editorMode: TemplateEditorMode = 'edit';
  statusMessage = '';
  statusTone: 'success' | 'error' | 'info' = 'info';

  ngOnInit(): void {
    this.templateId = this.normalizeTemplateId(this.route.snapshot.paramMap.get('templateId') || 'modern');
    const navState = window.history.state ?? {};
    this.templateName = navState.templateName || this.toTitleCase(this.templateId);
    this.templateCategory = navState.templateCategory || this.templateId.toUpperCase();
    const resumeId = this.route.snapshot.queryParamMap.get('resumeId');

    if (resumeId) {
      this.loadSavedTemplateResume(resumeId);
      return;
    }

    this.resume = this.initializeDefaultContent(this.templateId);
    this.isLoading = false;
  }

  initializeDefaultContent(templateId: string): ResumeBuilderContent {
    const demo = this.resumeService.createFreshTemplateData(templateId);
    return {
      templateId,
      templateName: this.templateName,
      templateType: this.templateCategory,
      source: 'TEMPLATE',
      personalInfo: {
        fullName: demo.personalInfo.fullName || '',
        email: demo.personalInfo.email || '',
        phone: demo.personalInfo.phone || '',
        location: demo.personalInfo.location || '',
        headline: demo.personalInfo.headline || '',
        linkedin: demo.personalInfo.linkedin || '',
        github: demo.personalInfo.github || '',
        portfolio: demo.personalInfo.portfolio || ''
      },
      summary: demo.summary || '',
      experience: demo.experience || [],
      education: demo.education || [],
      skills: demo.skills || [],
      projects: demo.projects || [],
      certifications: demo.certifications || [],
      languages: demo.languages || []
    };
  }

  onResumeChange(updatedResume: ResumeBuilderContent): void {
    this.resume = {
      ...updatedResume,
      templateId: this.templateId
    };
  }

  improveSummary(): void {
    if (!this.resume.summary?.trim()) {
      alert('Please write a summary first.');
      return;
    }

    this.isImprovingSummary = true;
    this.aiService.improveContent({
      text: this.resume.summary,
      type: 'summary',
      action: 'improve',
      resumeId: this.currentResumeId || null
    }).subscribe({
      next: (response) => {
        this.resume.summary = response.improvedText || this.resume.summary;
        this.isImprovingSummary = false;
      },
      error: () => {
        this.isImprovingSummary = false;
        alert('Could not improve summary right now.');
      }
    });
  }

  saveResume(): void {
    this.isSaving = true;
    this.persistResume().subscribe({
      next: () => {
        this.isSaving = false;
        this.setStatus('Template resume saved.', 'success');
      },
      error: () => {
        this.isSaving = false;
        this.setStatus('Could not save the template resume.', 'error');
      }
    });
  }

  exportPDF(): void {
    this.isExporting = true;
    const request = this.buildTemplateExportRequest();

    this.exportService.exportTemplateAsPdf(request).subscribe({
      next: (blob) => {
        const fileName = this.exportService.generateFileName(
          `resume-template-${this.templateName || this.templateId}`,
          'pdf'
        );
        this.exportService.downloadFile(blob, fileName);
        this.isExporting = false;
        this.setStatus('Template PDF exported from backend.', 'success');
      },
      error: () => {
        this.isExporting = false;
        this.setStatus('Template PDF export failed.', 'error');
      }
    });
  }

  toggleAtsCheck(): void {
    if (this.showAtsDrawer) {
      this.showAtsDrawer = false;
      return;
    }

    if (this.currentResumeId) {
      this.showAtsDrawer = true;
      return;
    }

    this.isSaving = true;
    this.persistResume().subscribe({
      next: () => {
        this.isSaving = false;
        this.showAtsDrawer = true;
        this.setStatus('Template saved and ready for ATS check.', 'success');
      },
      error: () => {
        this.isSaving = false;
        this.setStatus('Save the template resume before running ATS check.', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  setEditorMode(mode: TemplateEditorMode): void {
    this.editorMode = mode;
  }

  private loadSavedTemplateResume(resumeId: string): void {
    this.isLoading = true;
    this.resumeService.getResumeById(resumeId).subscribe({
      next: (resume) => {
        this.currentResumeId = resume.id;
        this.templateId = this.normalizeTemplateId(resume.templateId || this.templateId);
        this.templateName = resume.templateName || this.templateName;
        this.templateCategory = resume.templateType || this.templateCategory;
        this.resume = {
          ...this.initializeDefaultContent(this.templateId),
          ...resume.content,
          templateId: this.templateId,
          templateName: this.templateName,
          templateType: this.templateCategory,
          source: 'TEMPLATE'
        };
        this.isLoading = false;
      },
      error: () => {
        this.resume = this.initializeDefaultContent(this.templateId);
        this.isLoading = false;
      }
    });
  }

  private persistResume() {
    const payload = this.buildResumePayload();
    if (!this.currentResumeId) {
      return this.resumeService.createResume(payload);
    }
    return this.resumeService.updateResume(this.currentResumeId, payload);
  }

  private buildResumePayload() {
    return {
      title: this.resume.personalInfo?.fullName?.trim()
        ? `${this.resume.personalInfo.fullName} Resume`
        : `${this.templateName || this.templateId} Resume`,
      templateId: this.templateId,
      content: {
        ...this.resume,
        templateId: this.templateId,
        templateName: this.templateName,
        templateType: this.templateCategory,
        source: 'TEMPLATE'
      }
    };
  }

  private buildTemplateExportRequest(): TemplateExportRequest {
    return {
      templateId: this.templateId,
      templateName: this.templateName,
      editorMode: 'preview',
      resumeData: {
        templateId: this.templateId,
        templateName: this.templateName,
        templateType: this.templateCategory,
        source: 'TEMPLATE'
        ,
        personalInfo: { ...this.resume.personalInfo },
        summary: this.resume.summary,
        experience: this.resume.experience.map((item) => ({
          title: item.role,
          subtitle: item.company,
          dateRange: item.duration,
          bullets: [...item.highlights]
        })),
        education: this.resume.education.map((item) => ({
          title: item.degree,
          subtitle: item.institution,
          dateRange: item.year
        })),
        skills: [...this.resume.skills],
        projects: this.resume.projects.map((item) => ({
          title: item.name,
          description: item.description,
          link: item.link
        })),
        certifications: [...(this.resume.certifications ?? [])],
        languages: [...(this.resume.languages ?? [])]
      },
      styleConfig: {
        variant: this.templateId,
        theme: this.templateCategory,
        singlePage: true,
        compactSpacing: true
      }
    };
  }

  private setStatus(message: string, tone: 'success' | 'error' | 'info'): void {
    this.statusMessage = message;
    this.statusTone = tone;
  }

  private normalizeTemplateId(rawTemplateId: string): string {
    const normalized = rawTemplateId.trim().toLowerCase();
    if (normalized === 'minimal') {
      return 'minimalist';
    }
    return normalized;
  }

  private toTitleCase(value: string): string {
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
