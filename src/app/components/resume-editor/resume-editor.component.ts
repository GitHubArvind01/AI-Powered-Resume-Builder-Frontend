import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResumeService } from '../../services/resume.service';
import { TemplateDataService } from '../../services/template-data.service';
import { AuthStateService } from '../../services/auth-state.service';
import { AtsCheckerComponent } from '../ats-checker/ats-checker.component';
import { Resume, Template } from '../../models/template.model';
import { Subscription } from 'rxjs';

declare var html2pdf: any;

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [CommonModule, AtsCheckerComponent],
  templateUrl: './resume-editor.component.html',
  styleUrls: ['./resume-editor.component.css']
})
export class ResumeEditorComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resumeService = inject(ResumeService);
  private templateDataService = inject(TemplateDataService);
  private authState = inject(AuthStateService);
  private sanitizer = inject(DomSanitizer);

  resume: any = null;
  templateId: string = '';
  isLoading = true;
  isSaving = false;
  isExporting = false;
  showAtsDrawer = false;
  safeHtmlContent: SafeHtml = '';

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe((params: any) => {
        this.templateId = params['templateId'];
        const resumeId = params['id'];

        if (resumeId) {
          this.loadResume(resumeId);
        } else if (this.templateId) {
          this.initializeNewResume(this.templateId);
        } else {
          this.router.navigate(['/templates']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadResume(id: string): void {
    this.isLoading = true;
    this.resumeService.getResumeById(id).subscribe({
      next: (resume: Resume) => {
        this.resume = resume;
        this.templateId = resume.templateId;
        const content = typeof resume.content === 'string' ? JSON.parse(resume.content) : resume.content;
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(content.htmlContent || '');
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading resume:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  initializeNewResume(templateId: string): void {
    this.isLoading = true;
    this.templateDataService.getTemplateById(templateId).subscribe({
      // FIX: Changed to Template | undefined
      next: (template: Template | undefined) => {
        if (!template) {
          // If no template is found, redirect back
          this.router.navigate(['/templates']);
          return;
        }

        this.resume = { title: 'Untitled Resume', templateId };
        const dummyHtml = this.getTemplateHtml(templateId);
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(dummyHtml);
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/templates']);
      }
    });
  }

  saveResume(): void {
    const editorElement = document.querySelector('.resume-content-editable');
    if (!editorElement) return;

    this.isSaving = true;
    const htmlContent = editorElement.innerHTML;

    this.resumeService.saveResumeContent(this.templateId, htmlContent).subscribe({
      next: (savedResume: Resume) => {
        this.resume = savedResume;
        this.isSaving = false;
        if (!this.route.snapshot.params['id']) {
          this.router.navigate(['/resume', savedResume.id, 'edit'], { replaceUrl: true });
        }
      },
      error: (err: any) => {
        console.error('Error saving resume:', err);
        this.isSaving = false;
      }
    });
  }

  exportToPdf(): void {
    const element = document.getElementById('resume-editor-page');
    if (!element) return;

    this.isExporting = true;
    const opt = {
      margin: 0,
      filename: `${this.resume?.title || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf().from(element).set(opt).save().then(() => {
        this.isExporting = false;
      }).catch((err: any) => {
        console.error('PDF Export Error:', err);
        this.isExporting = false;
      });
    } else {
      console.error('html2pdf is not loaded');
      this.isExporting = false;
      window.print();
    }
  }

  goBack(): void {
    this.router.navigate(['/templates']);
  }

  private getTemplateHtml(templateId: string): string {
    const baseStyle = `
      <style>
        .t-container { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; }
        .t-header { border-bottom: 2px solid #444; margin-bottom: 20px; padding-bottom: 10px; }
        .t-name { font-size: 28px; font-weight: bold; margin: 0; color: #000; }
        .t-contact { font-size: 14px; color: #666; margin-top: 5px; }
        .t-section { margin-bottom: 20px; }
        .t-section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 10px; text-transform: uppercase; color: #444; }
        .t-item { margin-bottom: 15px; }
        .t-item-header { display: flex; justify-content: space-between; font-weight: bold; }
        .t-desc { font-size: 14px; margin-top: 5px; }
        ul.t-desc { padding-left: 20px; }
      </style>
    `;

    const content = `
      <div class="t-container">
        <header class="t-header">
          <h1 class="t-name" contenteditable="true">JOHN DOE</h1>
          <div class="t-contact" contenteditable="true">
            New York, NY | (555) 123-4567 | john.doe@example.com | linkedin.com/in/johndoe
          </div>
        </header>

        <section class="t-section">
          <div class="t-section-title">Professional Summary</div>
          <div class="t-desc" contenteditable="true">
            Results-driven Software Engineer with 5+ years of experience in building scalable web applications.
            Proficient in Angular, Spring Boot, and Cloud technologies. Proven track record of delivering high-quality code and improving system performance.
          </div>
        </section>

        <section class="t-section">
          <div class="t-section-title">Experience</div>
          <div class="t-item">
            <div class="t-item-header">
              <span contenteditable="true">Senior Software Engineer</span>
              <span contenteditable="true">Jan 2020 - Present</span>
            </div>
            <div contenteditable="true"><em>Tech Solutions Inc., New York</em></div>
            <ul class="t-desc" contenteditable="true">
              <li>Led a team of 5 developers to migrate legacy monolith to microservices using Spring Boot and Kafka.</li>
              <li>Improved application performance by 40% through optimized SQL queries and caching strategies.</li>
              <li>Implemented CI/CD pipelines reducing deployment time by 50%.</li>
            </ul>
          </div>
          <div class="t-item">
            <div class="t-item-header">
              <span contenteditable="true">Full Stack Developer</span>
              <span contenteditable="true">Jun 2016 - Dec 2019</span>
            </div>
            <div contenteditable="true"><em>Web Innovations Ltd., Boston</em></div>
            <ul class="t-desc" contenteditable="true">
              <li>Developed and maintained responsive web applications using Angular and Node.js.</li>
              <li>Collaborated with designers to create intuitive UI/UX for 10+ client projects.</li>
            </ul>
          </div>
        </section>

        <section class="t-section">
          <div class="t-section-title">Education</div>
          <div class="t-item">
            <div class="t-item-header">
              <span contenteditable="true">B.S. in Computer Science</span>
              <span contenteditaG93QXRzRHJhd2VyID0gZmFsc2VcIj5cbjwvYXBwLWF0cy1jaGVja2VyPlxuIl19able="true">2016</span>
            </div>
            <div contenteditable="true">University of Technology, GPA: 3.8/4.0</div>
          </div>
        </section>

        <section class="t-section">
          <div class="t-section-title">Skills</div>
          <div class="t-desc" contenteditable="true">
            <strong>Languages:</strong> Java, TypeScript, JavaScript, SQL, HTML5, CSS3<br>
            <strong>Frameworks:</strong> Spring Boot, Angular, React, Express.js<br>
            <strong>Tools:</strong> AWS, Docker, Kubernetes, Git, Jenkins, Jira
          </div>
        </section>
      </div>
    `;

    return baseStyle + content;
  }
}
