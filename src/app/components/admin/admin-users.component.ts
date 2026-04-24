import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import {
  AdminUpdateUserRequest,
  AdminUserDetails,
  AdminUserSummary
} from '../../models/template.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users: AdminUserSummary[] = [];
  selectedUser: AdminUserDetails | null = null;
  form: AdminUpdateUserRequest = this.createEmptyForm();
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): AdminUserSummary[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.users;
    }

    return this.users.filter((user) =>
      [user.fullName, user.email, user.role, user.subscriptionPlan]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  loadUsers(selectUserId?: number): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;

        if (selectUserId) {
          this.viewUser(selectUserId);
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  viewUser(userId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.getUserById(userId).subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.form = {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          active: user.active
        };
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to load user details.';
      }
    });
  }

  saveUser(): void {
    if (!this.selectedUser) {
      return;
    }

    this.isSaving = true;
    this.adminService.updateUser(this.selectedUser.id, this.form).subscribe({
      next: (user) => {
        this.successMessage = 'User updated successfully.';
        this.selectedUser = user;
        this.isSaving = false;
        this.loadUsers(user.id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to update user.';
        this.isSaving = false;
      }
    });
  }

  deactivateUser(userId: number): void {
    this.adminService.deactivateUser(userId).subscribe({
      next: (user) => {
        this.successMessage = 'User deactivated and notified by email.';
        this.selectedUser = user;
        this.form.active = false;
        this.loadUsers(user.id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to deactivate user.';
      }
    });
  }

  activateUser(userId: number): void {
    this.adminService.activateUser(userId).subscribe({
      next: (user) => {
        this.successMessage = 'User activated successfully.';
        this.selectedUser = user;
        this.form.active = true;
        this.loadUsers(user.id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to activate user.';
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Delete this user permanently? This action cannot be undone.')) {
      return;
    }

    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.successMessage = 'User deleted and notification email sent.';
        this.selectedUser = null;
        this.form = this.createEmptyForm();
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.message || 'Failed to delete user.';
      }
    });
  }

  private createEmptyForm(): AdminUpdateUserRequest {
    return {
      fullName: '',
      email: '',
      phone: '',
      role: 'USER',
      subscriptionPlan: 'FREE',
      active: true
    };
  }
}
