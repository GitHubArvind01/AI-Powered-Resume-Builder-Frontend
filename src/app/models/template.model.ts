export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  isPremium: boolean;
  isFavorite?: boolean;
  category: string;
  previewData?: any; // Realistic placeholder resume content for editor pre-population
}

export interface Resume {
  id: string;
  title: string;
  templateId: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  active: boolean;
  subscriptionPlan: 'FREE' | 'MONTHLY' | 'YEARLY' | 'PRO' | string;
}

export interface AuthResponse {
  token: string;
  message?: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat?: number;
  userId?: number;
  role?: string;
  subscriptionPlan?: string;
}

export interface AdminUserSummary {
  id: number;
  fullName: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  active: boolean;
  createdAt: string;
  resumeCount: number;
}

export interface AdminResume {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetails {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  subscriptionPlan: string;
  active: boolean;
  createdAt: string;
  resumeCount: number;
  resumes: AdminResume[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  premiumUsers: number;
  freeUsers: number;
  adminUsers: number;
  regularUsers: number;
}

export interface AdminUpdateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  subscriptionPlan: string;
  active: boolean;
}

export interface PaymentRequest {
  price: number;
  currency: string;
  method: string;
  intent: string;
  description: string;
}

export interface PaymentResponse {
  paymentLink: string;
  paymentId: string;
}

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro'
}
