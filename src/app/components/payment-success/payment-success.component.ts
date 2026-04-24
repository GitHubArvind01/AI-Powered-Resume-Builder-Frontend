import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PaymentService } from '../../services/payment.service';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private paymentService = inject(PaymentService);
  private authState = inject(AuthStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  /** Drives the animation state in the template */
  showAnimation = true;
  /** Shows an error message if verification fails */
  verificationFailed = false;
  /** Human-readable status line shown during processing */
  statusMessage = 'Verifying your payment…';

  private redirectTimeout: any;

  ngOnInit(): void {
    // Clear the in-progress flag that the paymentGuard checks.
    this.paymentService.setPaymentStatus(false);

    // Read paymentId from query params (?paymentId=xxx) OR from the
    // legacy window.location.search so both routing strategies work.
    const paymentId =
      this.route.snapshot.queryParamMap.get('paymentId') ??
      new URLSearchParams(window.location.search).get('paymentId');

    if (!paymentId) {
      // No paymentId in URL — nothing to verify, just go to dashboard.
      this.statusMessage = 'Payment confirmed! Redirecting…';
      this.scheduleRedirect('/dashboard', 2000);
      return;
    }

    // Step 1: Verify the payment with the backend.
    this.paymentService.verifyPayment(paymentId).subscribe({
      next: () => {
        // Step 2: Payment verified — now refresh user profile to get PRO plan.
        this.statusMessage = 'Updating your subscription…';
        this.userService.getUserProfile().subscribe({
          next: () => {
            this.statusMessage = 'All done! Taking you to your dashboard…';
            this.scheduleRedirect('/dashboard', 2000);
          },
          error: () => {
            // Profile refresh failed, but payment IS verified.
            // Token is intact; just redirect — dashboard will re-fetch.
            this.statusMessage = 'All done! Taking you to your dashboard…';
            this.scheduleRedirect('/dashboard', 2000);
          }
        });
      },
      error: () => {
        // Verification failed — show error, let user retry from /payment.
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

  private scheduleRedirect(path: string, delayMs: number): void {
    this.redirectTimeout = setTimeout(() => {
      this.showAnimation = false;
      this.router.navigate([path]);
    }, delayMs);
  }
}
