import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import {
  AdminUpdateUserRequest,
  AdminUserDetails,
  AdminUserSummary
} from '../../models/template.model';

type UserAction = 'save' | 'deactivate' | 'activate' | 'delete';

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
  isDetailLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  isModalOpen = false;

  currentAction: UserAction | null = null;
  actionUserId: number | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): AdminUserSummary[] {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return this.users;
    }

    return this.users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.role,
        user.subscriptionPlan
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  get isSaving(): boolean {
    return this.currentAction === 'save';
  }

  loadUsers(selectUserId?: number): void {
    this.isLoading = true;

    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;

        if (selectUserId && this.selectedUser?.id === selectUserId) {
          this.refreshSelectedUser(selectUserId);
        }
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || error?.message || 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  openUserModal(userId: number): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isModalOpen = true;
    this.isDetailLoading = true;

    this.adminService.getUserById(userId).subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.form = this.mapUserToForm(user);
        this.isDetailLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || error?.message || 'Failed to load user details.';
        this.isDetailLoading = false;
      }
    });
  }

  closeModal(): void {
    if (this.currentAction) {
      return;
    }

    this.isModalOpen = false;
    this.selectedUser = null;
    this.form = this.createEmptyForm();
    this.isDetailLoading = false;
  }

  saveUser(): void {
    if (!this.selectedUser || this.currentAction) {
      return;
    }

    const userId = this.selectedUser.id;

    this.runUserAction<AdminUserDetails>(
      'save',
      userId,
      () => this.adminService.updateUser(userId, this.form),
      (updatedUser) => {
        this.successMessage = 'User updated successfully.';
        this.selectedUser = updatedUser;
        this.form = this.mapUserToForm(updatedUser);
        this.loadUsers(updatedUser.id);
        this.closeModal();
      },
      'Failed to update user.'
    );
  }

  deactivateUser(userId: number): void {
    if (this.currentAction) {
      return;
    }

    this.runUserAction<AdminUserDetails>(
      'deactivate',
      userId,
      () => this.adminService.deactivateUser(userId),
      (user) => {
        this.successMessage = 'User deactivated and notified by email.';
        this.selectedUser = user;
        this.form = this.mapUserToForm(user);
        this.loadUsers(user.id);
        this.closeModal();
      },
      'Failed to deactivate user.'
    );
  }

  activateUser(userId: number): void {
    if (this.currentAction) {
      return;
    }

    this.runUserAction<AdminUserDetails>(
      'activate',
      userId,
      () => this.adminService.activateUser(userId),
      (user) => {
        this.successMessage = 'User activated successfully.';
        this.selectedUser = user;
        this.form = this.mapUserToForm(user);
        this.loadUsers(user.id);
        this.closeModal();
      },
      'Failed to activate user.'
    );
  }

  deleteUser(userId: number): void {
    if (
      this.currentAction ||
      !confirm('Delete this user permanently? This action cannot be undone.')
    ) {
      return;
    }

    this.runUserAction<void>(
      'delete',
      userId,
      () => this.adminService.deleteUser(userId),
      () => {
        this.successMessage = 'User deleted and notification email sent.';
        this.closeModalAfterDelete();
        this.loadUsers();
      },
      'Failed to delete user.'
    );
  }

  isActionLoading(action: UserAction, userId?: number): boolean {
    return (
      this.currentAction === action &&
      (userId == null || this.actionUserId === userId)
    );
  }

  private refreshSelectedUser(userId: number): void {
    this.adminService.getUserById(userId).subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.form = this.mapUserToForm(user);
      }
    });
  }

  private runUserAction<T>(
    action: UserAction,
    userId: number,
    request: () => Observable<T>,
    onSuccess: (response: T) => void,
    fallbackMessage: string
  ): void {
    this.errorMessage = '';
    this.currentAction = action;
    this.actionUserId = userId;

    request().subscribe({
      next: (response) => {
        this.currentAction = null;
        this.actionUserId = null;
        onSuccess(response);
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || error?.message || fallbackMessage;

        this.currentAction = null;
        this.actionUserId = null;
      }
    });
  }

  private closeModalAfterDelete(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.form = this.createEmptyForm();
    this.currentAction = null;
    this.actionUserId = null;
  }

  private mapUserToForm(user: AdminUserDetails): AdminUpdateUserRequest {
    return {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      subscriptionPlan: user.subscriptionPlan || 'FREE',
      active: user.active
    };
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
