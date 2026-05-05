import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  selectingTemplateId: string | null = null;

  categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'PROFESSIONAL', label: 'Professional' },
    { id: 'MODERN', label: 'Modern' },
    { id: 'CREATIVE', label: 'Creative' },
    { id: 'MINIMAL', label: 'Minimal' },
    { id: 'EXECUTIVE', label: 'Executive' }
  ];

  ngOnInit(): void {
    this.isLoading = true;
    this.loadTemplates();
    this.loadUserPlan();
  }

  loadTemplates(): void {
    this.templateDataService.getAllTemplates().subscribe({
      next: (templates: Template[]) => {
        this.templates = templates;
        this.filterTemplates();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading templates:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserPlan(): void {
    this.userService.userPlan$.subscribe((plan: UserPlan) => {
      this.currentUserPlan = plan;
      this.filterTemplates();
    });
  }

  filterTemplates(): void {
    let filtered = this.templates;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(
        (template) => template.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    this.filteredTemplates = filtered.slice(0, this.maxTemplates);
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterTemplates();
  }

  selectTemplate(template: Template): void {
    if (this.selectingTemplateId) {
      return;
    }

    this.selectedTemplate = template;
    if (template.isPremium && this.currentUserPlan === UserPlan.FREE) {
      this.showUpgradeModal = true;
      return;
    }

    this.selectingTemplateId = template.id;
    this.router.navigate(['/resume-preview', template.id]);
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
    this.selectedTemplate = null;
    this.selectingTemplateId = null;
  }

  goToUpgrade(): void {
    this.closeUpgradeModal();
    this.router.navigate(['/payment']);
  }

  getTemplateLabel(template: Template): string {
    return template.isPremium ? 'PRO' : 'FREE';
  }

  getPlanColor(template: Template): string {
    return template.isPremium ? 'pro-badge' : 'free-badge';
  }

  isLocked(template: Template): boolean {
    return template.isPremium && this.currentUserPlan === UserPlan.FREE;
  }

  isSelecting(template: Template): boolean {
    return this.selectingTemplateId === template.id;
  }
}
