export interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPro: boolean;
  isFavorite?: boolean;
  category: 'professional' | 'modern' | 'creative' | 'minimal' | 'executive';
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
  role: string;
  subscriptionPlan: string;
  message?: string;
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
