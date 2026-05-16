import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeBuilderContent } from '../../services/resume.service';
import { SharedResumeTemplateComponent } from './shared-resume-template.component';
import { TemplateEditorMode } from '../../services/export.service';

@Component({
  selector: 'app-professional-resume-template',
  standalone: true,
  imports: [SharedResumeTemplateComponent],
  template: '<app-shared-resume-template [resume]="resume" [editable]="editable" [mode]="mode" variant="professional" (resumeChange)="resumeChange.emit($event)"></app-shared-resume-template>'
})
export class ProfessionalResumeTemplateComponent {
  @Input({ required: true }) resume!: ResumeBuilderContent;
  @Input() editable = false;
  @Input() mode: TemplateEditorMode = 'edit';
  @Output() resumeChange = new EventEmitter<ResumeBuilderContent>();
}
