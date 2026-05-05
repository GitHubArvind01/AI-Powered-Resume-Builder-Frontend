import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeBuilderContent } from '../../services/resume.service';

@Component({
  selector: 'app-resume-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-preview.component.html',
  styleUrl: './resume-preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResumePreviewComponent {
  @Input({ required: true }) resume!: ResumeBuilderContent;

  visibleSkills(): string[] {
    return (this.resume.skills ?? []).filter((skill) => !!skill.trim());
  }
}
