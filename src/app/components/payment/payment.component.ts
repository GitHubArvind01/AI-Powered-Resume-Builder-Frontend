import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { UserService } from '../../services/user.service';
import { PaymentRequest } from '../../models/template.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Payment plans
  plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 9.99,
      duration: '1 month',
      features: [
        'All Premium Templates',
        'ATS Optimization',
        'Priority Support',
        'Resume Analytics'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 89.99,
      duration: '1 year',
      originalPrice: 119.88,
      features: [
        'All Premium Templates',
        'ATS Optimization',
        'Priority Support',
        'Resume Analytics',
        'Save 25%'
      ],
      popular: true
    }
  ];

  selectedPlan = 'yearly';
  paymentMethod = 'paypal';
  isProcessing = false;
  paymentError: string | null = null;
  showSuccessMessage = false;

  paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'credit_card', name: 'Credit Card', icon: '💳' }
  ];

  ngOnInit(): void {
    // Check if user is already premium
    this.userService.userProfile$.subscribe(profile => {
      if (profile?.isPremium) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  selectPlan(planId: string): void {
    this.selectedPlan = planId;
  }

  selectPaymentMethod(method: string): void {
    this.paymentMethod = method;
  }

  getPlanDetails(): any {
    return this.plans.find(p => p.id === this.selectedPlan);
  }

  async initiatePayment(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.paymentError = null;

    try {
      const plan = this.getPlanDetails();
      const paymentRequest: PaymentRequest = {
        price: plan.price,
        currency: 'USD',
        method: this.paymentMethod,
        intent: 'sale',
        description: `ResumeAI ${plan.name} Subscription - ${plan.duration}`
      };

      // Call payment service
      this.paymentService.initiatePayment(paymentRequest).subscribe(
        response => {
          if (response.paymentLink) {
            // Redirect to PayPal or payment gateway
            window.location.href = response.paymentLink;
          } else {
            this.paymentError = 'Failed to initiate payment. Please try again.';
            this.isProcessing = false;
          }
        },
        error => {
          console.error('Payment error:', error);
          this.paymentError = error?.error?.message || 'Payment initialization failed. Please try again.';
          this.isProcessing = false;
        }
      );
    } catch (error) {
      this.paymentError = 'An unexpected error occurred. Please try again.';
      this.isProcessing = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
