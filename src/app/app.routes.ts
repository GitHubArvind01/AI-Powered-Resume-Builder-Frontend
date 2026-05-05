import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';
import { ResumeEditorComponent } from "./components/resume-editor/resume-editor.component";

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'auth', component: AuthComponent, canActivate: [guestGuard] },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'payment',
    canActivate: [authGuard],
    loadComponent: () => import('./components/payment/payment.component').then((m) => m.PaymentComponent)
  },
  {
    path: 'payment-success',
    canActivate: [authGuard],
    loadComponent: () => import('./components/payment-success/payment-success.component').then((m) => m.PaymentSuccessComponent)
  },
  {
    path: 'payment-failed',
    canActivate: [authGuard],
    loadComponent: () => import('./components/payment-failed/payment-failed.component').then((m) => m.PaymentFailedComponent)
  },
  {
    path: 'editor/:templateId',
    canActivate: [authGuard],
    loadComponent: () => import('./components/resume-editor/resume-editor.component').then((m) => m.ResumeEditorComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: 'resume/create', component: ResumeEditorComponent, canActivate: [authGuard] },
  { path: 'resume/:id/edit', component: ResumeEditorComponent, canActivate: [authGuard] },
  {
    path: 'resume/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./components/resume-editor/resume-editor.component').then((m) => m.ResumeEditorComponent)
  },
  {
    path: 'resume-preview/:templateId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/resume-preview/resume-preview.component')
        .then((m) => m.ResumePreviewComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./components/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/admin-users.component').then((m) => m.AdminUsersComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
