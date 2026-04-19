# ResumeAI - AI-Powered Resume Builder Platform

## Overview

ResumeAI is a modern, professional Resume Builder Platform built with Angular 19 and TypeScript. It provides users with an intuitive interface to create, edit, and manage resumes using premium templates, with a free and pro tier system.

## Features

### 1. **Landing Page (Welcome Component)**
- Hero section with call-to-action buttons
- Statistics showcasing platform success metrics
- Features showcase with animated cards
- Professional resume preview animation
- Pricing comparison (Free vs Pro)
- Premium feel with gradient backgrounds and smooth animations
- Fully responsive design

### 2. **Dashboard**
- **Header with**:
  - Logo and branding
  - Main action buttons (Create Resume, Upload Resume, ATS Check)
  - Profile dropdown menu with logout option
  
- **Welcome Section**:
  - Personalized greeting for the logged-in user
  - Plan status indicator
  - Upgrade CTA for free users

- **Quick Stats**:
  - Total resumes created
  - Available templates count (based on plan)
  - Current plan status

- **Resumes Management**:
  - Display user's created resumes
  - Edit, delete, download, and ATS check actions
  - Beautiful resume card preview
  - Empty state with action button

- **Templates Section**:
  - Always visible on dashboard
  - Shows filtered templates based on user plan
  - Pro users: access all templates
  - Free users: can view but cannot edit pro templates

- **Upgrade CTA**:
  - Visible for free users only
  - Encourages upgrade to pro plan

### 3. **Templates Component** (Reusable)
- Professional template showcase
- Category filtering (All, Professional, Modern, Creative, Minimal, Executive)
- Free vs PRO badges with visual distinction
- Lock icon with overlay on pro templates for free users
- Upgrade modal showing benefits
- Loading states with spinner animation
- Fully responsive grid layout
- Smooth animations and transitions

### 4. **Payment Component**
- Pricing plans display (Monthly & Yearly)
- Plan selection with visual feedback
- Payment method selection (PayPal, Credit Card)
- Order summary with pricing calculation
- "Most Popular" badge for recommended plan
- Multiple pricing tiers with features list
- Benefits showcase section (6 key benefits)
- FAQ section addressing common questions
- Security note and payment guarantee
- Error handling and processing states
- Integration with backend payment API

### 5. **Services**

#### **AuthService**
- User registration and verification
- Login/logout functionality
- Password recovery flow
- Token management

#### **UserService**
- Fetch user profile information
- Update user profile
- Upgrade to premium plan
- Track user plan status (FREE/PRO)
- BehaviorSubjects for reactive state management

#### **ResumeService**
- Fetch all templates
- Get user's resumes
- Create new resume
- Update resume content
- Delete resume
- Upload resume from file
- Perform ATS check on resume
- Reactive data streams with BehaviorSubjects

#### **PaymentService**
- Initiate payment flow
- Verify payment completion
- Retrieve payment history
- Integration with PayPal API

### 6. **Models & Types**
- `Template`: Resume template interface
- `Resume`: User's resume data
- `UserProfile`: User information
- `PaymentRequest`: Payment initiation payload
- `PaymentResponse`: Payment status response
- `UserPlan`: Enum (FREE, PRO)

### 7. **UI/UX Features**
- ✅ Smooth animations using Angular animations
- ✅ Gradient backgrounds and modern design
- ✅ Loading spinners and states
- ✅ Modal dialogs for upgrades
- ✅ Dropdown menus
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Error handling and user feedback
- ✅ Premium SaaS feel throughout

## Payment Flow

### Integration with Backend

**Endpoint**: `POST /payment/pay`

**Request Payload**:
```json
{
  "price": 9.99,
  "currency": "USD",
  "method": "paypal",
  "intent": "sale",
  "description": "ResumeAI Monthly Subscription - 1 month"
}
```

**Response**:
```json
{
  "paymentLink": "https://www.paypal.com/checkoutsession/...",
  "paymentId": "pay_123456789"
}
```

**Flow**:
1. User selects a plan (Monthly/Yearly)
2. User selects payment method (PayPal/Credit Card)
3. User clicks "Pay Now"
4. Frontend calls backend payment endpoint
5. Backend returns PayPal payment link
6. User is redirected to PayPal payment page
7. After payment completion, user is redirected back
8. User plan is upgraded to PRO

## Routing Structure

```
/                    → Welcome/Landing Page
/auth                → Login/Register (Guest only)
/dashboard           → Main Dashboard (Auth required)
/payment             → Payment & Upgrade Page (Auth required)
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── welcome/          → Landing Page
│   │   ├── auth/             → Authentication
│   │   ├── dashboard/        → Main Dashboard
│   │   ├── templates/        → Reusable Templates
│   │   └── payment/          → Payment Page
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── resume.service.ts
│   │   └── payment.service.ts
│   ├── models/
│   │   └── template.model.ts → All TypeScript interfaces
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── guest.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── app.routes.ts        → Route configuration
│   ├── app.config.ts        → App configuration
│   ├── app.component.ts
│   └── app.component.html
├── styles.css               → Global styles
└── index.html
```

## Key Technologies

- **Framework**: Angular 19
- **Language**: TypeScript 5.7
- **HTTP Client**: Angular HttpClient with Interceptors
- **Animations**: Angular Animations
- **Styling**: CSS3 with CSS Variables
- **State Management**: RxJS BehaviorSubjects
- **UI/UX**: Responsive Design, SaaS Premium Feel

## Styling Features

- **Color Scheme**:
  - Primary: #4a90e2 (Professional Blue)
  - Secondary Gradients: Modern gradient combinations
  - Text: #1a1a1a (Dark text for readability)
  
- **Spacing**: Consistent padding and margins
- **Animations**: Smooth transitions, bouncing effects, fade-ins
- **Responsive**: Mobile-first approach with breakpoints
- **Accessibility**: Proper contrast, focus states, semantic HTML

## Loading & Error States

- Loading spinners with animation
- Error messages with visual indicators
- Success notifications
- Toast messages for feedback
- Disabled states for processing buttons

## API Integration Checklist

The frontend is ready to integrate with the following backend endpoints:

- [ ] `POST /auth/user/register-request` - Registration request
- [ ] `POST /auth/user/register-user` - Registration verification
- [ ] `POST /auth/user/login` - User login
- [ ] `GET /user/profile` - Get user profile
- [ ] `PUT /user/profile` - Update user profile
- [ ] `POST /user/upgrade-premium` - Upgrade to premium
- [ ] `GET /resume/templates` - Get all templates
- [ ] `GET /resume/user-resumes` - Get user's resumes
- [ ] `POST /resume/create` - Create new resume
- [ ] `PUT /resume/{id}` - Update resume
- [ ] `DELETE /resume/{id}` - Delete resume
- [ ] `POST /resume/upload` - Upload resume file
- [ ] `POST /resume/{id}/ats-check` - Perform ATS check
- [ ] `POST /payment/pay` - Initiate payment (PayPal)
- [ ] `GET /payment/verify/{id}` - Verify payment
- [ ] `GET /payment/history` - Payment history

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Update environment URLs**:
   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     gatewayUrl: 'http://localhost:8080/api'
   };
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Configuration

Create/update environment files:

**src/environments/environment.ts**:
```typescript
export const environment = {
  production: false,
  gatewayUrl: 'http://localhost:8080/api'
};
```

**src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  gatewayUrl: 'https://api.resumeai.com'
};
```

## Future Enhancements

- [ ] Real-time collaboration on resumes
- [ ] AI-powered content suggestions
- [ ] Job description analysis
- [ ] Resume scoring and feedback
- [ ] Cover letter builder
- [ ] Interview preparation tools
- [ ] Export to multiple formats
- [ ] LinkedIn profile integration
- [ ] Dark mode support
- [ ] Multi-language support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - Feel free to use this project for personal or commercial use.

---

**Built with ❤️ using Angular and TypeScript**
