import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeBuilderContent } from '../../services/resume.service';
import { SharedResumeTemplateComponent } from './shared-resume-template.component';

@Component({
  selector: 'app-executive-resume-template',
  standalone: true,
  imports: [SharedResumeTemplateComponent],
  template: '<app-shared-resume-template [resume]="resume" [editable]="editable" variant="executive" (resumeChange)="resumeChange.emit($event)"></app-shared-resume-template>'
})
export class ExecutiveResumeTemplateComponent {
  @Input({ required: true }) resume!: ResumeBuilderContent;
  @Input() editable = false;
  @Output() resumeChange = new EventEmitter<ResumeBuilderContent>();
}
