import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

// Define the steps of the auth flow
type AuthStep = 'LOGIN_SIGNUP' | 'VERIFY_REGISTRATION' | 'FORGOT_PASSWORD_REQ' | 'VERIFY_FORGOT_OTP' | 'RESET_PASSWORD';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  // UI State
  isLoginMode = true;
  isLoading = false;
  isGoogleLoading = false;
  currentStep: AuthStep = 'LOGIN_SIGNUP';
  errorMessage = '';
  successMessage = '';

  // Form Data - Matches Java RegisterRequest DTO
  authData = {
    fullName: '',
    email: '',
    password: '',
    phone: ''
  };

  otpValue = '';
  newPassword = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) this.processGoogleLogin(code);
    });
  }

  //this method has two jobs - Remove non-numbers || Limit to 10 digits
  onPhoneInput(): void {
    this.authData.phone = this.authData.phone
      .replace(/[^0-9]/g, '')
      .slice(0, 10);
  }

  // --- Main Actions ---

    onSubmit(form: any) {
    if (form.invalid) {
      this.showError("Please fill all required fields correctly.");
      return;
    }

    this.errorMessage = '';
    this.isLoading = true; // Start loading
    if (this.isLoginMode) {
      this.handleLogin();
    } else {
      this.handleRegisterRequest();
    }
  }

  private handleLogin() {
    const credentials = { email: this.authData.email, password: this.authData.password };
    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/dashboard'])
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  private handleRegisterRequest() {
    this.authService.registerRequest(this.authData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showSuccess("OTP sent to your email!");
        this.currentStep = 'VERIFY_REGISTRATION';
      },
        error: (err) => {
          this.isLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  private extractMessage(err: any): string {
    // 1. Check for Network Error (Server Down / CORS)
    if (err.status === 0) {
      return "Could not connect to the server. Please check your internet or try again later.";
    }

    // 2. Handle Spring Boot ErrorResponse (err.error is the JSON body)
    if (err.error) {
      // If it's already an object
      if (typeof err.error === 'object' && err.error.message) {
        return err.error.message;
      }

      // If it's a JSON string (sometimes happens with certain interceptors)
      if (typeof err.error === 'string') {
        try {
          const parsed = JSON.parse(err.error);
          return parsed.message || "An unexpected error occurred.";
        } catch {
          return err.error; // Return raw string if not JSON
        }
      }
    }

    // 3. Fallback for generic HTTP errors (404, 500 without body)
    if (err.status === 404) return "Requested resource not found.";
    if (err.status === 500) return "Internal server error. Our team has been notified.";

    return err.message || "Something went wrong. Please try again.";
}

  // --- OTP & Reset Logic ---

  verifyRegisterOtp() {
    this.isLoading = true;
    this.authService.registerVerify(this.authData.email, this.otpValue).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  initiateForgotPassword() {
    if (!this.authData.email) {
      this.showError("Please enter your email first.");
      return;
    }
    this.isLoading = true;
    this.authService.forgotPasswordRequest(this.authData.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess("OTP sent for password reset.");
        this.currentStep = 'VERIFY_FORGOT_OTP';
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  verifyForgotOtp() {
    this.isLoading = true;
    this.authService.verifyForgotOtp(this.authData.email, this.otpValue).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'RESET_PASSWORD'
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  submitNewPassword() {
    this.isLoading = true;
    this.authService.resetPassword(this.authData.email, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        // alert("Password updated successfully! Please login.");
        this.resetToLogin();
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  // --- Helpers ---

  private processGoogleLogin(code: string) {
    this.isGoogleLoading = true;
    this.authService.handleGoogleCallback(code).subscribe({
      next: () => {
        this.isGoogleLoading = false;
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/dashboard'])
      },
      error: (err) => {
        this.isGoogleLoading = false;
        this.showError(this.extractMessage(err));
      }
    });
  }

  loginWithGoogle() {
    if (this.isGoogleLoading) return; // prevent multiple clicks

    this.isGoogleLoading = true;
    this.authService.initiateGoogleLogin();
  }

  resetToLogin() {
    this.isLoginMode = true;
    this.currentStep = 'LOGIN_SIGNUP';
    this.errorMessage = '';
    this.successMessage = '';
    this.otpValue = '';
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
