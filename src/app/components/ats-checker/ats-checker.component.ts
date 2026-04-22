import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeService } from '../../services/resume.service';
import { UserService } from '../../services/user.service';
import { UserPlan } from '../../models/template.model';
import { trigger, transition, style, animate } from '@angular/animations';

export interface AtsCheckResult {
  score: number;
  issues: AtsIssue[];
  suggestions: string[];
  creditsUsed: number;
  creditsRemaining: number;
}

export interface AtsIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  line?: number;
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
export class AtsCheckerComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() resumeId: string = '';
  @Output() close = new EventEmitter<void>();

  private resumeService = inject(ResumeService);
  private userService = inject(UserService);

  result: AtsCheckResult | null = null;
  isLoading = false;
  error: string | null = null;
  userPlan: UserPlan = UserPlan.FREE;
  criticalIssuesCount = 0;
  warningIssuesCount = 0;
  infoIssuesCount = 0;

  ngOnInit(): void {
    this.userService.userPlan$.subscribe(plan => {
      this.userPlan = plan;
    });
  }

  ngOnChanges(changes: any): void {
    if (changes['isOpen'] && this.isOpen && this.resumeId) {
      this.performAtsCheck();
    }
  }

  performAtsCheck(): void {
    if (!this.resumeId) return;

    this.isLoading = true;
    this.error = null;

    this.resumeService.performAtsCheck(this.resumeId).subscribe(
      result => {
        this.result = result;
        this.calculateIssuesCounts();
        this.isLoading = false;
      },
      error => {
        console.error('ATS check error:', error);
        this.error = error?.error?.message || 'Failed to perform ATS check';
        this.isLoading = false;
      }
    );
  }

  calculateIssuesCounts(): void {
    if (!this.result) return;

    this.criticalIssuesCount = this.result.issues.filter(i => i.severity === 'critical').length;
    this.warningIssuesCount = this.result.issues.filter(i => i.severity === 'warning').length;
    this.infoIssuesCount = this.result.issues.filter(i => i.severity === 'info').length;
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
    return 'Poor';
  }

  closeModal(): void {
    this.close.emit();
  }

  downloadReport(): void {
    if (!this.result) return;

    const report = `
ATS Check Report
================
Score: ${this.result.score}/100 (${this.getScoreLabel()})
Credits Used: ${this.result.creditsUsed}
Credits Remaining: ${this.result.creditsRemaining}

Critical Issues: ${this.criticalIssuesCount}
Warnings: ${this.warningIssuesCount}
Info: ${this.infoIssuesCount}

Issues:
${this.result.issues.map(issue => `[${issue.severity.toUpperCase()}] ${issue.message}`).join('\n')}

Suggestions:
${this.result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
    `;

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
