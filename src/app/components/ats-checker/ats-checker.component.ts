import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService } from '../../services/resume.service';
import { UserService } from '../../services/user.service';
import { UserPlan } from '../../models/template.model';
import { trigger, transition, style, animate } from '@angular/animations';

export interface AtsDisplayResult {
  score: number;
  suggestions: string[];
  overallFeedback?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

@Component({
  selector: 'app-ats-checker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ats-checker.component.html',
  styleUrls: ['./ats-checker.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class AtsCheckerComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() resumeId: string = '';
  @Output() close = new EventEmitter<void>();

  private resumeService = inject(ResumeService);
  private userService = inject(UserService);

  result: AtsDisplayResult | null = null;
  isLoading = false;
  error: string | null = null;
  userPlan: UserPlan = UserPlan.FREE;

  ngOnInit(): void {
    this.userService.userPlan$.subscribe(plan => {
      this.userPlan = plan;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.resumeId) {
      // Reset state and re-fetch whenever the drawer opens
      this.result = null;
      this.error = null;
      this.performAtsCheck();
    }
  }

  performAtsCheck(): void {
    if (!this.resumeId) return;

    this.isLoading = true;
    this.error = null;

    this.resumeService.performAtsCheck(this.resumeId).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ATS check error:', err);
        this.error = err?.error?.message || err?.message || 'Failed to perform ATS check. Please save your resume first.';
        this.isLoading = false;
      }
    });
  }

  getScoreColor(): string {
    if (!this.result) return '#ccc';
    const score = this.result.score;
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getScoreLabel(): string {
    if (!this.result) return 'N/A';
    const score = this.result.score;
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  }

  getScoreDashoffset(): number {
    // For animated SVG circle: circumference = 2πr = 2π×45 ≈ 283
    if (!this.result) return 283;
    return 283 - (283 * this.result.score) / 100;
  }

  closeModal(): void {
    this.close.emit();
  }

  downloadReport(): void {
    if (!this.result) return;

    const matchedSection = this.result.matchedKeywords?.length
      ? `\nMatched Keywords:\n${this.result.matchedKeywords.join(', ')}`
      : '';
    const missingSection = this.result.missingKeywords?.length
      ? `\nMissing Keywords:\n${this.result.missingKeywords.join(', ')}`
      : '';

    const report = [
      'ATS Check Report',
      '================',
      `Score: ${this.result.score}/100 (${this.getScoreLabel()})`,
      matchedSection,
      missingSection,
      '',
      'Actionable Suggestions:',
      ...this.result.suggestions.map((s, i) => `${i + 1}. ${s}`),
      '',
      'Overall Feedback:',
      this.result.overallFeedback ?? 'N/A'
    ].join('\n').trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ats-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
