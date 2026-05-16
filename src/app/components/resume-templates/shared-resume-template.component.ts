import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResumeBuilderContent } from '../../services/resume.service';
import { TemplateEditorMode } from '../../services/export.service';

@Component({
  selector: 'app-shared-resume-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-resume-template.component.html',
  styleUrl: './shared-resume-template.component.css'
})
export class SharedResumeTemplateComponent {
  @Input({ required: true }) resume!: ResumeBuilderContent;
  @Input() editable = false;
  @Input() mode: TemplateEditorMode = 'edit';
  @Input() variant: 'minimalist' | 'modern' | 'professional' | 'creative' | 'executive' = 'modern';
  @Output() resumeChange = new EventEmitter<ResumeBuilderContent>();

  get isEditMode(): boolean {
    return this.editable && this.mode === 'edit';
  }

  trackByIndex(index: number): number {
    return index;
  }

  emitChange(): void {
    this.resumeChange.emit({
      ...this.resume,
      personalInfo: { ...this.resume.personalInfo },
      experience: [...this.resume.experience],
      education: [...this.resume.education],
      skills: [...this.resume.skills],
      projects: [...this.resume.projects],
      certifications: [...(this.resume.certifications ?? [])],
      languages: [...(this.resume.languages ?? [])]
    });
  }

  addExperience(): void {
    this.resume.experience.push({
      company: '',
      role: '',
      duration: '',
      highlights: ['']
    });
    this.emitChange();
  }

  addExperienceHighlight(experienceIndex: number): void {
    this.resume.experience[experienceIndex].highlights.push('');
    this.emitChange();
  }

  addEducation(): void {
    this.resume.education.push({
      institution: '',
      degree: '',
      year: ''
    });
    this.emitChange();
  }

  addSkill(): void {
    this.resume.skills.push('');
    this.emitChange();
  }

  addProject(): void {
    this.resume.projects.push({
      name: '',
      description: '',
      link: ''
    });
    this.emitChange();
  }

  addListItem(key: 'certifications' | 'languages'): void {
    this.resume[key] = [...(this.resume[key] ?? []), ''];
    this.emitChange();
  }

  getExperienceLabel(index: number): string {
    const item = this.resume.experience[index];
    return item?.role?.trim() || item?.company?.trim() || `Experience ${index + 1}`;
  }
}
