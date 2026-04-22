import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router'; // Import this!
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './payment-failed.component.html',
  styleUrl: './payment-failed.component.css'
})
export class PaymentFailedComponent implements OnInit {
  private paymentService = inject(PaymentService);

  ngOnInit(): void {
    // We clear it so they can try again or navigate away
    this.paymentService.setPaymentStatus(false);
  }
}
