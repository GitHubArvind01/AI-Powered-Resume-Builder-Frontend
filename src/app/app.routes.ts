import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PaymentComponent } from './components/payment/payment.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { ResumeEditorComponent } from './components/resume-editor/resume-editor.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { PaymentFailedComponent } from './components/payment-failed/payment-failed.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'auth', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
  // paymentGuard is intentionally NOT on payment-success:
  // PayPal's redirect is a full cross-origin navigation that wipes sessionStorage,
  // so the guard's flag would always be missing and block the user from landing here.
  // The component validates the payment itself via the ?paymentId= query param.
  { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [authGuard] },
  { path: 'payment-failed', component: PaymentFailedComponent, canActivate: [authGuard] },
  { path: 'resume/create', component: ResumeEditorComponent, canActivate: [authGuard] },
  { path: 'resume/:id/edit', component: ResumeEditorComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
