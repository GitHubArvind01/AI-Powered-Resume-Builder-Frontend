import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService, ResumeBuilderContent } from '../../services/resume.service';
import { ExportService } from '../../services/export.service';
import { AtsCheckerComponent } from '../ats-checker/ats-checker.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resume-preview',
  standalone: true,
  imports: [CommonModule, AtsCheckerComponent],
  templateUrl: './resume-preview.component.html',
  styleUrl: './resume-preview.component.css'
})
export class ResumePreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private resumeService = inject(ResumeService);
  private exportService = inject(ExportService);
  private router = inject(Router);

  resume!: ResumeBuilderContent;
  currentResumeId: string = '';
  templateId: string = '';
  isLoading = true;
  isSaving = false;
  isExporting = false;
  showAtsDrawer = false;

  ngOnInit(): void {
    this.templateId = this.route.snapshot.params['templateId'];

    // Check if data was passed from the TemplatesComponent click
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['previewData']) {
      this.resume = navigation.extras.state['previewData'];
      this.isLoading = false;
    }

    this.loadData(); // Still run this to sync with the latest backend version
  }

  loadData(): void {
    // Step 1: Get user resumes to find the latest one to edit
    this.resumeService.getUserResumes().subscribe({
      next: (resumes) => {
        if (resumes.length > 0) {
          const latest = resumes[0];
          this.currentResumeId = latest.id;
          this.resume = latest.content as ResumeBuilderContent;
        } else {
          // If no resume exists, initialize with default structure
          // Note: Your service uses createEmptyResumeContent internally,
          // we use a blank object here that matches ResumeBuilderContent
          this.resume = this.initializeDefaultContent();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load resume:', err);
        this.isLoading = false;
      }
    });
  }

  // Handle direct A4 page edits
  onContentChange(section: string, field: string | null, event: any): void {
    const value = event.target.innerText;
    if (section === 'personalInfo' && field) {
      (this.resume.personalInfo as any)[field] = value;
    } else if (section === 'summary') {
      this.resume.summary = value;
    }
  }

  saveResume(): void {
    if (!this.currentResumeId) {
      // Create new if it doesn't exist
      this.resumeService.createResume({
        title: 'New Resume',
        templateId: this.templateId,
        content: this.resume
      }).subscribe(res => {
        this.currentResumeId = res.id;
        alert('Resume Created!');
      });
      return;
    }

    this.isSaving = true;
    this.resumeService.updateResume(this.currentResumeId, {
      title: 'Updated Resume',
      content: this.resume
    }).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Saved Successfully!');
      },
      error: () => this.isSaving = false
    });
  }

  exportPDF(): void {
    if (!this.currentResumeId) {
      alert('Please save your resume first before exporting.');
      return;
    }

    this.isExporting = true;
    this.exportService.exportAsPdf(this.currentResumeId).subscribe({
      next: (blob: Blob) => {
        const fileName = this.exportService.generateFileName('My_Resume', 'pdf');
        this.exportService.downloadFile(blob, fileName);
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Export failed:', err);
        this.isExporting = false;
      }
    });
  }

  toggleAtsCheck(): void {
    this.showAtsDrawer = !this.showAtsDrawer;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private initializeDefaultContent(): ResumeBuilderContent {
    return {
      templateId: this.templateId,
      personalInfo: { fullName: '', email: '', phone: '', location: '', headline: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: []
    };
  }
}
