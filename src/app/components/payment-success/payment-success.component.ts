import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { PaymentService } from '../../services/payment.service';

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
      this.verificationFailed = true;
      this.statusMessage = 'Payment reference is missing. Please contact support if you were charged.';
      this.scheduleRedirect('/payment', 4000);
      return;
    }

    this.paymentService.verifyPayment(paymentId).subscribe({
      next: (response) => {
        this.authState.setAuthenticatedState({
          token: response.token,
          message: response.message,
          user: response.user
        });
        this.statusMessage = 'Payment successful! Premium access is now active.';
        this.scheduleRedirect('/dashboard', 1800);
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

  private scheduleRedirect(path: string, delayMs: number): void {
    this.redirectTimeout = setTimeout(() => {
      this.showAnimation = false;
      this.router.navigate([path]);
    }, delayMs);
  }
}
