import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentRequest, PaymentResponse } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/payment`;

  // Initiate payment
  initiatePayment(paymentData: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/pay`, paymentData);
  }

  // Verify payment
  verifyPayment(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${paymentId}`);
  }

  // Get payment history
  getPaymentHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }
}
