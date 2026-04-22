# Frontend & Backend Integration Guide

## 🔗 API Integration Points

### 1. Registration Endpoint

**Frontend Sends:**
```json
POST /auth/register-request
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

**Backend Should:**
- ✅ Match Java `RegisterRequest` DTO (fullName, email, password, phone)
- ✅ Validate all 4 fields are not null
- ✅ Send OTP to email
- ✅ Return success message

**Frontend Flow:**
1. User fills: fullName, email, password, phone
2. Click "Create Account"
3. Frontend sends POST request with exact DTO structure
4. Backend validates and sends OTP
5. Frontend shows "OTP sent" message
6. Moves to verification step

---

### 2. Profile Endpoint (CRITICAL FOR PAYMENT FLOW)

**Endpoint:** `GET /user/profile`

**Backend Should Return:**
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "fullName": "John Doe",          // Optional but recommended
  "phone": "+1234567890",          // Optional but recommended
  "isPremium": true,               // Boolean
  "subscription_plan": "YEARLY",   // "FREE", "MONTHLY", "YEARLY", or "PRO"
  "subscriptionExpiry": "2025-04-22T00:00:00Z",
  "createdAt": "2024-04-22T00:00:00Z"
}
```

**When This is Called:**
1. When user logs in
2. When user registers (after verification)
3. **When user completes payment (CRITICAL)** ← PaymentSuccessComponent calls this
4. Periodically during session
5. When user navigates to dashboard

**Frontend Usage:**
```typescript
// In PaymentSuccessComponent
ngOnInit() {
  this.userService.loadUserProfile();  // ← Fetches latest profile
  
  setTimeout(() => {
    // After 3 seconds, user sees updated subscription status
    this.router.navigate(['/dashboard']);
  }, 3000);
}
```

---

### 3. Payment Completion Flow

**Current Flow:**
```
1. User on /payment page
2. Clicks "Pay with PayPal" or "Pay with Card"
3. Frontend calls: POST /payment/initiate
4. Backend returns: { paymentLink, paymentId }
5. Frontend navigates to: /payment-success
6. PaymentSuccessComponent:
   - Calls userService.loadUserProfile()
   - Shows 3-second animation
   - Auto-redirects to /dashboard
7. Dashboard displays updated subscription
```

**Backend Integration Notes:**
- ⚠️ **IMPORTANT**: Ensure payment processing completes BEFORE user sees success page
- ⚠️ After payment confirmation, update user's `isPremium` to `true`
- ⚠️ Set `subscription_plan` to appropriate value (MONTHLY, YEARLY, etc.)
- ⚠️ Return updated profile when GET /user/profile is called post-payment

---

## 📱 Frontend Components & Their Dependencies

### Dashboard Component
```typescript
userProfile: UserProfile          // From userService
userPlan: UserPlan               // "free" or "pro"

// Conditional Rendering Used:
*ngIf="userPlan === 'free'"       // Show "Get Pro" button
*ngIf="userPlan === 'pro'"        // Show "Pro Member" badge
*ngIf="userPlan === 'pro'"        // Show premium features
```

### Templates Component
```typescript
currentUserPlan: UserPlan         // From userService

// Conditional Rendering Used:
*ngIf="template.isPro && currentUserPlan === 'free'"  
  → Show lock icon, disable template

*ngIf="!template.isPro || currentUserPlan === 'pro'"  
  → Show "Use Template" button

// Filtering
if (currentUserPlan === FREE) {
  filtered = filtered.filter(t => !t.isPro);
}
```

### Payment Success Component
```typescript
ngOnInit() {
  this.userService.loadUserProfile();  // Triggers GET /user/profile
  
  setTimeout(() => {
    this.router.navigate(['/dashboard']);  // Auto-redirect after 3 seconds
  }, 3000);
}
```

---

## 🔐 LocalStorage Usage

**Keys Used:**
```typescript
localStorage.setItem('token', res.token);
localStorage.setItem('userProfile', JSON.stringify(profile));
```

**On Fresh Load:**
1. AuthService checks `token` existence
2. UserService loads profile from API
3. Profile stored in localStorage (cache)
4. BehaviorSubject emits to subscribers
5. Components reactively update

---

## ✅ Backend Checklist for Payment Integration

- [ ] Update user's `isPremium` field to `true` after successful payment
- [ ] Set `subscription_plan` field (MONTHLY, YEARLY, or PRO)
- [ ] Set `subscriptionExpiry` date based on plan
- [ ] When GET /user/profile is called after payment, return updated fields
- [ ] Validate payment status is complete before marking user as premium
- [ ] Send confirmation email to user with subscription details
- [ ] Handle subscription cancellation/renewal if applicable
- [ ] Return proper error messages if payment processing fails

---

## 🧪 Testing Scenarios

### Scenario 1: New User Registration
```
1. Go to /auth
2. Click "Signup"
3. Fill: fullName, email, password, phone
4. Verify JSON sent has correct fields (no username, confirmPassword)
5. Receive OTP
6. Verify OTP
7. Auto-redirect to /dashboard
8. Backend should have created user with all 4 fields
```

### Scenario 2: User Upgrades to Pro
```
1. User on dashboard with userPlan = 'free'
2. Click "Get Pro"
3. Navigate to /payment
4. Select plan (Monthly or Yearly)
5. Complete payment
6. Navigate to /payment-success
7. See 3-second checkmark animation
8. Auto-redirect to /dashboard
9. Verify userPlan = 'pro'
10. "Pro Member" badge displays
11. All 30+ templates visible
```

### Scenario 3: Page Refresh After Payment
```
1. Complete payment scenario (Scenario 2)
2. Refresh page while still seeing success animation
3. Page should still show animation
4. Auto-redirect should still work
5. Dashboard should show Pro status
6. Verify localStorage has updated profile
```

---

## 🚨 Common Issues & Solutions

### Issue: User doesn't see Pro status after payment
**Solution:** Ensure GET /user/profile returns `isPremium: true` and `subscription_plan` set

### Issue: Dashboard shows conflicting Pro/Free status
**Solution:** Check if userProfile$ and userPlan$ BehaviorSubjects are in sync

### Issue: Templates not showing as unlocked
**Solution:** Verify currentUserPlan is 'pro' and template.isPro is correctly set

### Issue: Payment success animation doesn't redirect
**Solution:** Check browser console for errors, verify router is properly injected

---

## 📞 Support & Communication

### For Backend Integration Questions:
1. Check IMPLEMENTATION_COMPLETE.md for detailed changes
2. Review UpdatedUserProfile model in template.model.ts
3. Test with curl/Postman before integration

### Frontend Changes Made:
- ✅ Registration form now sends: fullName, email, password, phone
- ✅ PaymentSuccessComponent added with animation
- ✅ Profile refresh logic integrated
- ✅ Subscription plan support added to UserProfile interface
- ✅ Conditional rendering for Pro features already implemented

---

## 🎯 Next Steps

1. **Backend Developer:**
   - Update RegisterRequest DTO validation in Java
   - Update GET /user/profile endpoint to include subscription_plan
   - Update payment processing to set isPremium and subscription_plan
   - Test with frontend using curl/Postman

2. **Frontend Developer:**
   - Run `npm start` to build and test
   - Test registration flow with new DTO fields
   - Test payment → success → dashboard flow
   - Verify all conditional rendering works

3. **QA/Testing:**
   - Follow testing scenarios above
   - Test on mobile and desktop
   - Test with different subscription plans
   - Test payment success animation timing

---

**Last Updated:** April 22, 2026
**Status:** ✅ Frontend Implementation Complete
**Ready for:** Backend Integration & Testing

