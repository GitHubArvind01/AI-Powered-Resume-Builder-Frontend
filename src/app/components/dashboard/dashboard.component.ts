import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { TemplatesComponent } from '../templates/templates.component';
import { UserService } from '../../services/user.service';
import { ResumeService } from '../../services/resume.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile, UserPlan, Resume } from '../../models/template.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TemplatesComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private resumeService = inject(ResumeService);
  private authService = inject(AuthService);

  userProfile: UserProfile | null = null;
  userPlan: UserPlan = UserPlan.FREE;
  userResumes: Resume[] = [];
  isAdmin = false;
  isLoading = false;
  isProcessing = false;
  showProfileDropdown = false;
  selectedFile: File | null = null;
  uploadError: string | null = null;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadUserProfile();
    this.loadUserResumes();
  }

  loadUserProfile(): void {
    this.userService.userProfile$.subscribe((profile: UserProfile | null) => {
      this.userProfile = profile;
    });

    this.userService.userPlan$.subscribe((plan: UserPlan) => {
      this.userPlan = plan;
    });
  }

  loadUserResumes(): void {
    this.isLoading = true;
    this.resumeService.getUserResumes().subscribe(
      (resumes: Resume[]) => {
        this.userResumes = resumes;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading resumes:', error);
        this.isLoading = false;
      }
    );
  }

  // Main Actions
  createResume(): void {
    this.router.navigate(['/resume/create']);
  }

  uploadResume(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadError = null;

      // Validate file type
      if (!file.name.toLowerCase().match(/\.(pdf|doc|docx)$/)) {
        this.uploadError = 'Please upload a PDF or Word document';
        this.selectedFile = null;
        return;
      }

      // Upload the file
      this.isProcessing = true;
      this.resumeService.uploadResume(file).subscribe(
        (resume: any) => {
          this.userResumes.push(resume);
          this.isProcessing = false;
          this.selectedFile = null;
          // Optionally navigate to edit
          this.router.navigate([`/resume/${resume.id}/edit`]);
        },
        (error: any) => {
          console.error('Upload error:', error);
          this.uploadError = error?.error?.message || 'Failed to upload resume';
          this.isProcessing = false;
        }
      );
    }
  }

  performAtsCheck(resumeId: string): void {
    if (resumeId === 'current') {
      if (!this.userResumes.length) {
        this.uploadError = 'Create a resume first to run ATS analysis.';
        return;
      }
      resumeId = this.userResumes[0].id;
    }

    this.isProcessing = true;
    this.resumeService.performAtsCheck(resumeId).subscribe(
      (result: any) => {
        console.log('ATS Check result:', result);
        // Show ATS check modal/result
        this.isProcessing = false;
      },
      (error: any) => {
        console.error('ATS Check error:', error);
        this.isProcessing = false;
      }
    );
  }

  // User Profile Actions
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }

  openAdminPanel(): void {
    this.router.navigate(['/admin']);
  }

  upgradeProfile(): void {
    this.router.navigate(['/payment']);
  }

  // Resume Actions
  editResume(resumeId: string): void {
    this.router.navigate([`/resume/${resumeId}/edit`]);
  }

  deleteResume(resumeId: string): void {
    if (confirm('Are you sure you want to delete this resume?')) {
      this.resumeService.deleteResume(resumeId).subscribe(
        () => {
          this.userResumes = this.userResumes.filter(r => r.id !== resumeId);
        },
        (error: any) => {
          console.error('Delete error:', error);
        }
      );
    }
  }

  downloadResume(resumeId: string): void {
    this.router.navigate([`/resume/${resumeId}/edit`]);
  }
}
