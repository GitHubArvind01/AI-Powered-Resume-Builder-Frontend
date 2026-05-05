import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  public authService = inject(AuthService);
  private router = inject(Router);

  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;

  message: { type: 'success' | 'error', text: string } | null = null;

  // OTP STATE
  showOtpBox = false;
  otpCode = '';
  pendingEmail = '';

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.userService.userProfile$.subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone
        });
      }
    });
  }

  // BACK BUTTON
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.message = null;
  }

  // =========================
  // UPDATE PROFILE
  // =========================
  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isLoading = true;

    const currentEmail = this.authService.getEmail();
    const updateData = this.profileForm.value;

    this.authService.updateProfile(currentEmail!, updateData).subscribe({
      next: (res) => {
        this.isLoading = false;

        // EMAIL CHANGE CASE
        if (res.message?.includes('verify')) {
          this.showOtpBox = true;
          this.pendingEmail = updateData.email;
          this.isEditing = false;

          this.message = {
            type: 'success',
            text: 'Enter OTP sent to your new email'
          };
        } else {
          // NORMAL UPDATE
          this.isEditing = false;
          this.message = {
            type: 'success',
            text: res.message || 'Profile updated successfully!'
          };
        }
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'Update failed. Please try again.' };
      }
    });
  }

  // =========================
  // VERIFY OTP
  // =========================
  verifyOtp() {
    if (!this.otpCode) return;

    this.isLoading = true;

    const currentEmail = this.authService.getEmail();

    this.authService.verifyEmailUpdate(currentEmail!, this.otpCode).subscribe({
      next: (res) => {
        this.isLoading = false;

        this.showOtpBox = false;

        this.message = {
          type: 'success',
          text: res.message || 'Email verified successfully'
        };
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'Invalid or expired OTP' };
      }
    });
  }

  // CANCEL OTP
  cancelOtp() {
    this.showOtpBox = false;
    this.otpCode = '';
  }
}
