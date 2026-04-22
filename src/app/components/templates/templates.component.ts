import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResumeService } from '../../services/resume.service';
import { TemplateDataService } from '../../services/template-data.service';
import { UserService } from '../../services/user.service';
import { Template, UserPlan } from '../../models/template.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleHover', [
      transition(':enter', [
        style({ transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class TemplatesComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private templateDataService = inject(TemplateDataService);
  private userService = inject(UserService);
  private router = inject(Router);

  @Input() showTitle: boolean = true;
  @Input() maxTemplates: number = 10;

  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  selectedCategory: string = 'all';
  isLoading: boolean = false;
  currentUserPlan: UserPlan = UserPlan.FREE;
  showUpgradeModal: boolean = false;
  selectedTemplate: Template | null = null;

  categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'professional', label: 'Professional' },
    { id: 'modern', label: 'Modern' },
    { id: 'creative', label: 'Creative' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'executive', label: 'Executive' }
  ];

  ngOnInit(): void {
    this.isLoading = true;
    this.loadTemplates();
    this.loadUserPlan();
  }

  loadTemplates(): void {
    this.templateDataService.getAllTemplates().subscribe(
      templates => {
        this.templates = templates;
        this.filterTemplates();
        this.isLoading = false;
      },
      error => {
        console.error('Error loading templates:', error);
        this.isLoading = false;
      }
    );
  }

  loadUserPlan(): void {
    this.userService.userPlan$.subscribe(
      plan => {
        this.currentUserPlan = plan;
      }
    );
  }

  filterTemplates(): void {
    let filtered = this.templates;
    
    // If user is free, only show free templates
    if (this.currentUserPlan === UserPlan.FREE) {
      filtered = filtered.filter(t => !t.isPro);
    }
    
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.selectedCategory);
    }
    
    this.filteredTemplates = filtered.slice(0, this.maxTemplates);
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterTemplates();
  }

  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    if (template.isPro && this.currentUserPlan === UserPlan.FREE) {
      this.showUpgradeModal = true;
      return;
    }
    this.createResumeFromTemplate(template);
  }

  createResumeFromTemplate(template: Template): void {
    // Navigate to create resume with template
    this.router.navigate(['/resume/create'], { 
      queryParams: { templateId: template.id } 
    });
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
    this.selectedTemplate = null;
  }

  goToUpgrade(): void {
    this.closeUpgradeModal();
    this.router.navigate(['/payment']);
  }

  getTemplateLabel(template: Template): string {
    return template.isPro ? '⭐ PRO' : '🆓 FREE';
  }

    getPlanColor(template: Template): string {
    return template.isPro ? 'pro-badge' : 'free-badge';
  }
}
