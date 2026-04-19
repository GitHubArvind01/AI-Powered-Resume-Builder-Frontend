import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemplatesComponent } from '../templates/templates.component';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, TemplatesComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class WelcomeComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoggedIn = false;
  currentUser: any = null;

  ngOnInit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToPayment(): void {
    this.router.navigate(['/payment']);
  }
}