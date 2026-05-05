import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminDashboardStats } from '../../models/template.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats: AdminDashboardStats | null = null;
  isLoading = true;
  errorMessage = '';

  get statCards(): Array<{ label: string; value: number | string; detail: string }> {
    if (!this.stats) {
      return [];
    }

    const activationRate = this.stats.totalUsers
      ? `${Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100)}%`
      : '0%';

    return [
      { label: 'Total Users', value: this.stats.totalUsers, detail: 'All registered accounts' },
      { label: 'Active Users', value: this.stats.activeUsers, detail: 'Currently enabled accounts' },
      { label: 'Premium Users', value: this.stats.premiumUsers, detail: 'Monetized subscriptions' },
      { label: 'Free Users', value: this.stats.freeUsers, detail: 'Eligible for upsell' },
      { label: 'Inactive Users', value: this.stats.inactiveUsers, detail: 'Need recovery flow' },
      { label: 'Activation Rate', value: activationRate, detail: 'Active users / total users' }
    ];
  }

  get planMix(): Array<{ label: string; value: number; tone: string }> {
    if (!this.stats) {
      return [];
    }

    return [
      { label: 'Premium', value: this.stats.premiumUsers, tone: 'premium' },
      { label: 'Free', value: this.stats.freeUsers, tone: 'free' },
      { label: 'Admins', value: this.stats.adminUsers, tone: 'admins' }
    ];
  }

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to load admin analytics.';
        this.isLoading = false;
      }
    });
  }
}
