import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentRequest, PaymentResponse, PaymentVerificationResponse } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/payments`;

  // Key for session storage
  private readonly PAYMENT_FLAG = 'payment_in_progress';

  setPaymentStatus(inProgress: boolean): void {
    if (inProgress) {
      sessionStorage.setItem(this.PAYMENT_FLAG, 'true');
    } else {
      sessionStorage.removeItem(this.PAYMENT_FLAG);
    }
  }

  isPaymentInProgress(): boolean {
    return sessionStorage.getItem(this.PAYMENT_FLAG) === 'true';
  }

  // Initiate payment
  initiatePayment(paymentData: PaymentRequest): Observable<PaymentResponse> {
    this.setPaymentStatus(true);
    return this.http.post<PaymentResponse>(`${this.apiUrl}/pay`, paymentData);
  }

  // Verify payment
  verifyPayment(paymentId: string): Observable<PaymentVerificationResponse> {
    return this.http.get<PaymentVerificationResponse>(`${this.apiUrl}/verify/${paymentId}`);
  }

  // Get payment history
  getPaymentHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
}
