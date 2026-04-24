import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdminDashboardStats,
  AdminUpdateUserRequest,
  AdminUserDetails,
  AdminUserSummary
} from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.gatewayUrl}/admin`;

  getStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<AdminUserSummary[]> {
    return this.http.get<AdminUserSummary[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<AdminUserDetails> {
    return this.http.get<AdminUserDetails>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, payload: AdminUpdateUserRequest): Observable<AdminUserDetails> {
    return this.http.put<AdminUserDetails>(`${this.apiUrl}/users/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  deactivateUser(id: number): Observable<AdminUserDetails> {
    return this.http.patch<AdminUserDetails>(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  activateUser(id: number): Observable<AdminUserDetails> {
    return this.http.patch<AdminUserDetails>(`${this.apiUrl}/users/${id}/activate`, {});
  }
}
