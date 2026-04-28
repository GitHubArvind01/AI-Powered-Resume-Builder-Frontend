import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  showAnimation = true;
  verificationFailed = false;
  statusMessage = 'Verifying your payment...';

  private redirectTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.paymentService.setPaymentStatus(false);

    const paymentId =
      this.route.snapshot.queryParamMap.get('paymentId') ??
      new URLSearchParams(window.location.search).get('paymentId');

    if (!paymentId) {
      this.statusMessage = 'Payment confirmed!';
      this.forceRelogin();
      return;
    }

    this.paymentService.verifyPayment(paymentId).subscribe({
      next: () => {
        this.statusMessage = 'Payment successful!';
        this.forceRelogin(); // now delay is handled inside
      },
      error: () => {
        this.verificationFailed = true;
        this.statusMessage = 'Payment verification failed. Please contact support.';
        this.scheduleRedirect('/payment', 4000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
  private forceRelogin(): void {
    // Step 1: show success message FIRST
    this.statusMessage = 'Payment successful! Redirecting to login...';

    // Step 2: wait 2 seconds BEFORE clearing session
    this.redirectTimeout = setTimeout(() => {
      // Clear everything AFTER delay
      this.authService.logout();
      sessionStorage.clear();

      this.showAnimation = false;
      this.router.navigate(['/login']);
    }, 2000);
  }
  private scheduleRedirect(path: string, delayMs: number): void {
    this.redirectTimeout = setTimeout(() => {
      this.showAnimation = false;
      this.router.navigate([path]);
    }, delayMs);
  }
}
