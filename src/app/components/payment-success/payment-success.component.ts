import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import {PaymentService} from '../../services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private userService = inject(UserService);

  showAnimation = true;
  private animationTimeout: any;

  ngOnInit(): void {
    this.paymentService.setPaymentStatus(false);
    // Refresh user profile to get updated subscription status
    this.userService.loadUserProfile();

    // Show animation for 3 seconds, then redirect
    this.animationTimeout = setTimeout(() => {
      this.showAnimation = false;
      this.router.navigate(['/dashboard']);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }
}

