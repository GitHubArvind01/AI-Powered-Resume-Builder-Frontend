import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeService } from '../../services/resume.service';
import { AiService } from '../../services/ai.service';
import { ExportService } from '../../services/export.service';
import { UserService } from '../../services/user.service';
import { Resume, UserPlan, Template } from '../../models/template.model';
import { trigger, transition, style, animate } from '@angular/animations';

interface EditorSection {
  id: string;
  label: string;
  icon: string;
  expanded: boolean;
}

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './resume-editor.component.html',
  styleUrls: ['./resume-editor.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ResumeEditorComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private exportService = inject(ExportService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild('previewContainer') previewContainer: ElementRef | undefined;

  resume: Resume | null = null;
  resumeForm: FormGroup = this.fb.group({});
  isLoading = false;
  isSaving = false;
  isExporting = false;
  showAiModal = false;
  showStylePanel = false;
  selectedText: string = '';
  userPlan: UserPlan = UserPlan.FREE;
  aiRemaining = 0;
  aiError: string | null = null;
  exportError: string | null = null;

  activeSection: string = 'personal';
  sections: EditorSection[] = [
    { id: 'personal', label: 'Personal Info', icon: '👤', expanded: true },
    { id: 'summary', label: 'Summary', icon: '📝', expanded: false },
    { id: 'experience', label: 'Experience', icon: '💼', expanded: false },
    { id: 'education', label: 'Education', icon: '🎓', expanded: false },
    { id: 'skills', label: 'Skills', icon: '⭐', expanded: false }
  ];

  styleOptions = {
    fontSize: 12,
    fontFamily: 'Arial',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    isBold: false,
    isItalic: false,
    isUnderline: false
  };

  templates: Template[] = [];

  ngOnInit(): void {
    this.loadUserPlan();
    this.loadResume();
  }

  loadUserPlan(): void {
    this.userService.userPlan$.subscribe(plan => {
      this.userPlan = plan;
      this.aiRemaining = this.aiService.getRemainingImprovements();
    });
  }

  loadResume(): void {
    const resumeId = this.route.snapshot.paramMap.get('id');
    if (!resumeId) {
      this.initializeNewResume();
      return;
    }

    this.isLoading = true;
    this.resumeService.getResumeById(resumeId).subscribe(
      resume => {
        this.resume = resume;
        this.initializeForm();
        this.isLoading = false;
      },
      error => {
        console.error('Error loading resume:', error);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }
    );
  }

  initializeNewResume(): void {
    const templateId = this.route.snapshot.queryParamMap.get('templateId') || 'professional';
    this.resume = {
      id: 'new-' + Date.now(),
      title: 'My Resume',
      templateId,
      content: {
        templateId,
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.initializeForm();
  }

  initializeForm(): void {
    if (!this.resume) return;

    const content = this.resume.content;
    this.resumeForm = this.fb.group({
      title: [this.resume.title, Validators.required],
      templateId: [this.resume.templateId],
      personalInfo: this.fb.group({
        fullName: [content.personalInfo?.fullName || '', Validators.required],
        email: [content.personalInfo?.email || '', [Validators.required, Validators.email]],
        phone: [content.personalInfo?.phone || ''],
        location: [content.personalInfo?.location || '']
      }),
      summary: [content.summary || ''],
      experience: this.fb.array(content.experience?.map((exp: any) => 
        this.createExperienceGroup(exp)) || []),
      education: this.fb.array(content.education?.map((edu: any) => 
        this.createEducationGroup(edu)) || []),
      skills: this.fb.array(content.skills?.map((skill: string) => 
        this.fb.group({ skill: [skill] })) || [])
    });

    this.resumeForm.valueChanges.subscribe(() => this.autoSave());
  }

  createExperienceGroup(exp?: any) {
    return this.fb.group({
      jobTitle: [exp?.jobTitle || ''],
      companyName: [exp?.companyName || ''],
      startDate: [exp?.startDate || ''],
      endDate: [exp?.endDate || ''],
      responsibilities: [exp?.responsibilities?.join('\n') || '']
    });
  }

  createEducationGroup(edu?: any) {
    return this.fb.group({
      degree: [edu?.degree || ''],
      school: [edu?.school || ''],
      graduationDate: [edu?.graduationDate || '']
    });
  }

  addExperience(): void {
    const control = this.resumeForm.get('experience') as any;
    control.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    const control = this.resumeForm.get('experience') as any;
    control.removeAt(index);
  }

  addEducation(): void {
    const control = this.resumeForm.get('education') as any;
    control.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    const control = this.resumeForm.get('education') as any;
    control.removeAt(index);
  }

  addSkill(): void {
    const control = this.resumeForm.get('skills') as any;
    control.push(this.fb.group({ skill: [''] }));
  }

  removeSkill(index: number): void {
    const control = this.resumeForm.get('skills') as any;
    control.removeAt(index);
  }

  autoSave(): void {
    if (this.resumeForm.invalid) return;

    this.isSaving = true;
    const content = this.resumeForm.value;
    
    // Convert responsibilities back to array
    if (content.experience) {
      content.experience = content.experience.map((exp: any) => ({
        ...exp,
        responsibilities: exp.responsibilities ? exp.responsibilities.split('\n').filter((r: string) => r.trim()) : []
      }));
    }

    if (this.resume?.id.startsWith('new-')) {
      this.resumeService.createResume({
        title: content.title,
        templateId: content.templateId,
        content
      }).subscribe(
        created => {
          this.resume = created;
          this.isSaving = false;
          this.router.navigate(['/resume', created.id, 'edit'], { replaceUrl: true });
        },
        error => {
          console.error('Error creating resume:', error);
          this.isSaving = false;
        }
      );
    } else if (this.resume) {
      this.resumeService.updateResume(this.resume.id, content).subscribe(
        updated => {
          this.isSaving = false;
        },
        error => {
          console.error('Error updating resume:', error);
          this.isSaving = false;
        }
      );
    }
  }

  improveContent(field: string): void {
    if (!this.aiService.canUseAiFeatures()) {
      alert(`You've reached your daily limit. Upgrade to Pro for unlimited improvements!`);
      return;
    }

    const content = this.resumeForm.get(field)?.value;
    if (!content) return;

    this.showAiModal = true;
    this.aiError = null;
    this.aiService.improveContent({ text: content, type: 'general', resumeId: this.resume?.id }).subscribe(
      result => {
        this.resumeForm.patchValue({ [field]: result.improvedText });
        this.aiService.incrementUsage();
        this.aiRemaining = this.aiService.getRemainingImprovements();
        this.showAiModal = false;
      },
      error => {
        console.error('AI error:', error);
        this.aiError = error?.error?.message || 'AI enhancement failed. Please try again.';
        this.showAiModal = false;
      }
    );
  }

  exportResume(format: 'pdf' | 'docx' | 'txt'): void {
    if (!this.resume) return;

    if (format !== 'pdf') {
      this.exportError = 'Only PDF export is available right now.';
      return;
    }

    this.isExporting = true;
    this.exportError = null;

    this.exportService.exportAsPdf(this.resume.id).subscribe(
      blob => {
        const fileName = this.exportService.generateFileName(this.resume!.title, 'pdf');
        this.exportService.downloadFile(blob, fileName);
        this.isExporting = false;
      },
      error => {
        console.error('Export error:', error);
        this.exportError = error?.error?.message || 'PDF export failed. Please try again.';
        this.isExporting = false;
      }
    );
  }

  performAtsCheck(): void {
    if (!this.resume) return;

    this.isLoading = true;
    this.resumeService.performAtsCheck(this.resume.id).subscribe(
      result => {
        alert(`ATS Score: ${result.score}/100\nIssues: ${result.issues.length}`);
        this.isLoading = false;
      },
      error => {
        console.error('ATS check error:', error);
        this.isLoading = false;
      }
    );
  }

  toggleSection(sectionId: string): void {
    const section = this.sections.find(s => s.id === sectionId);
    if (section) {
      section.expanded = !section.expanded;
    }
  }

  saveResume(): void {
    this.autoSave();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  get experienceArray() {
    return this.resumeForm.get('experience') as any;
  }

  get educationArray() {
    return this.resumeForm.get('education') as any;
  }

  get skillsArray() {
    return this.resumeForm.get('skills') as any;
  }
    showExportMenu(): void {
        console.log('Export menu clicked');
    }
}
