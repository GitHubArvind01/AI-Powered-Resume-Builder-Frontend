import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PaymentService } from '../services/payment.service'; // Create a service to track state

export const paymentGuard: CanActivateFn = () => {
  const router = inject(Router);
  const paymentService = inject(PaymentService);

  if (paymentService.isPaymentInProgress()) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};
