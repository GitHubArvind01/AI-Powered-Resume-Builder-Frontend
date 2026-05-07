import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeBuilderContent } from '../../services/resume.service';

@Component({
  selector: 'app-shared-resume-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-resume-template.component.html',
  styleUrl: './shared-resume-template.component.css'
})
export class SharedResumeTemplateComponent {
  @Input({ required: true }) resume!: ResumeBuilderContent;
  @Input() editable = false;
  @Input() variant: 'minimalist' | 'modern' | 'professional' | 'creative' | 'executive' = 'modern';
  @Output() resumeChange = new EventEmitter<ResumeBuilderContent>();

  onFieldInput(path: string, event: Event): void {
    const target = event.target as HTMLElement;
    this.setValue(path, target.innerText.trim());
    this.resumeChange.emit(this.resume);
  }

  onListInput(index: number, key: 'certifications' | 'languages', event: Event): void {
    const target = event.target as HTMLElement;
    const values = [...(this.resume[key] ?? [])];
    values[index] = target.innerText.trim();
    this.resume[key] = values.filter((value) => value?.trim());
    this.resumeChange.emit(this.resume);
  }

  addListItem(key: 'certifications' | 'languages'): void {
    this.resume[key] = [...(this.resume[key] ?? []), ''];
    this.resumeChange.emit(this.resume);
  }

  private setValue(path: string, value: string): void {
    const keys = path.split('.');
    let current: any = this.resume;
    for (let index = 0; index < keys.length - 1; index += 1) {
      current = current[keys[index]];
    }
    current[keys[keys.length - 1]] = value;
  }
}
