import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService, ResumeBuilderContent } from '../../services/resume.service';
import { ExportService } from '../../services/export.service';
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

  ngOnInit(): void {
    this.templateId = this.normalizeTemplateId(this.route.snapshot.paramMap.get('templateId') || 'modern');
    const navState = window.history.state ?? {};
    this.templateName = navState.templateName || this.toTitleCase(this.templateId);
    this.templateCategory = navState.templateCategory || this.templateId.toUpperCase();
    this.resume = this.initializeDefaultContent(this.templateId);
    this.isLoading = false;
  }

  initializeDefaultContent(templateId: string): ResumeBuilderContent {
    const demo = this.resumeService.createFreshTemplateData(templateId);
    return {
      templateId,
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

    const payload = {
      title: this.resume.personalInfo?.fullName?.trim()
        ? `${this.resume.personalInfo.fullName} Resume`
        : `${this.templateName || this.templateId} Resume`,
      templateId: this.templateId,
      content: {
        ...this.resume,
        templateId: this.templateId
      }
    };

    if (!this.currentResumeId) {
      this.resumeService.createResume(payload).subscribe({
        next: (res) => {
          this.currentResumeId = res.id;
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      });
      return;
    }

    this.resumeService.updateResume(this.currentResumeId, payload).subscribe({
      next: () => {
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  async exportPDF(): Promise<void> {
    const element = document.getElementById('resume-a4-page');
    if (!element) {
      alert('Resume preview not found.');
      return;
    }

    this.isExporting = true;
    try {
      const fileName = this.exportService.generateFileName(
        `${this.resume.personalInfo?.fullName || 'resume'}_${this.templateName || this.templateId}`,
        'pdf'
      );
      await this.exportService.exportElementToPdf(element, fileName);
    } finally {
      this.isExporting = false;
    }
  }

  toggleAtsCheck(): void {
    if (!this.currentResumeId) {
      alert('Please save this resume first before running ATS check.');
      return;
    }

    this.showAtsDrawer = !this.showAtsDrawer;
  }

  applyTextCommand(command: 'bold' | 'italic' | 'underline' | 'fontSize', value?: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    document.execCommand(command, false, value);
  }

  makeTextLarge(): void {
    this.applyTextCommand('fontSize', '5');
  }

  makeTextSmall(): void {
    this.applyTextCommand('fontSize', '3');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
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
