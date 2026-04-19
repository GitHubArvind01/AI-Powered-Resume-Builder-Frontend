# ResumeAI Backend Integration Checklist

## Frontend Status: ✅ COMPLETE

The frontend is fully built and ready for backend integration. This document lists all backend requirements.

---

## Authentication Backend

### User Registration
- [ ] `POST /auth/user/register-request`
  - **Input**: `{ email, password, name }`
  - **Output**: `{ message, requiresOtp: true }`
  - **Action**: Send OTP to email

- [ ] `POST /auth/user/register-user`
  - **Input**: `{ email, otp }`
  - **Output**: `{ token, user: { id, email, name } }`
  - **Action**: Verify OTP and create user account

### User Login
- [ ] `POST /auth/user/login`
  - **Input**: `{ email, password }`
  - **Output**: `{ token, user: { id, email, name } }`
  - **Action**: Authenticate user and return JWT token

### Password Recovery
- [ ] `POST /auth/user/forgot-password/request`
  - **Input**: `{ email }`
  - **Output**: `{ message }`
  - **Action**: Send password reset OTP

- [ ] `POST /auth/user/forgot-password/verify`
  - **Input**: `{ email, otp }`
  - **Output**: `{ message }`
  - **Action**: Verify OTP

- [ ] `POST /auth/user/forgot-password/reset`
  - **Input**: `{ email, newPassword }`
  - **Output**: `{ message }`
  - **Action**: Update password

---

## User Management Backend

### User Profile
- [ ] `GET /user/profile`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Output**: 
    ```json
    {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "isPremium": false,
      "subscriptionExpiry": null,
      "createdAt": "2024-04-20T10:30:00Z"
    }
    ```
  - **Action**: Retrieve current user profile

- [ ] `PUT /user/profile`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Input**: `{ name, email, ... }`
  - **Output**: Updated user profile
  - **Action**: Update user information

### Plan Management
- [ ] `POST /user/upgrade-premium`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Input**: `{ paymentId }`
  - **Output**: 
    ```json
    {
      "isPremium": true,
      "subscriptionExpiry": "2025-04-20T10:30:00Z"
    }
    ```
  - **Action**: Upgrade user to premium after payment verification

---

## Resume Management Backend

### Templates
- [ ] `GET /resume/templates`
  - **Output**: 
    ```json
    [
      {
        "id": "template_1",
        "name": "Professional",
        "description": "Clean and professional design",
        "imageUrl": "https://...",
        "isPro": false,
        "category": "professional"
      },
      {
        "id": "template_2",
        "name": "Modern",
        "description": "Modern and stylish design",
        "imageUrl": "https://...",
        "isPro": true,
        "category": "modern"
      }
    ]
    ```
  - **Action**: Return 30+ templates with metadata

### User's Resumes
- [ ] `GET /resume/user-resumes`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Output**: 
    ```json
    [
      {
        "id": "resume_1",
        "title": "My Resume",
        "templateId": "template_1",
        "content": { "...": "..." },
        "createdAt": "2024-04-20T10:30:00Z",
        "updatedAt": "2024-04-20T10:30:00Z"
      }
    ]
    ```
  - **Action**: Retrieve all resumes for current user

### Resume CRUD
- [ ] `POST /resume/create`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Input**: `{ title, templateId }`
  - **Output**: 
    ```json
    {
      "id": "resume_new",
      "title": "My Resume",
      "templateId": "template_1",
      "content": {},
      "createdAt": "2024-04-20T10:30:00Z",
      "updatedAt": "2024-04-20T10:30:00Z"
    }
    ```
  - **Action**: Create new resume from template

- [ ] `PUT /resume/{id}`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Input**: `{ content, title }`
  - **Output**: Updated resume
  - **Action**: Update resume content

- [ ] `DELETE /resume/{id}`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Output**: `{ message: "Deleted successfully" }`
  - **Action**: Delete resume

### Resume Upload
- [ ] `POST /resume/upload`
  - **Headers**: `{ Authorization: Bearer <token>, Content-Type: multipart/form-data }`
  - **Input**: File (PDF, DOC, DOCX)
  - **Output**: 
    ```json
    {
      "id": "resume_uploaded",
      "title": "Uploaded Resume",
      "templateId": null,
      "content": { "parsed": "content" },
      "createdAt": "2024-04-20T10:30:00Z",
      "updatedAt": "2024-04-20T10:30:00Z"
    }
    ```
  - **Action**: Parse and store uploaded resume

### ATS Check
- [ ] `POST /resume/{id}/ats-check`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Output**: 
    ```json
    {
      "score": 85,
      "issues": [
        {
          "severity": "warning",
          "message": "Consider using more industry keywords"
        }
      ],
      "suggestions": [
        "Add metrics to achievement statements",
        "Use ATS-friendly formatting"
      ]
    }
    ```
  - **Action**: Analyze resume and return ATS score

---

## Payment Backend

### Payment Initiation
- [ ] `POST /payment/pay`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Input**: 
    ```json
    {
      "price": 9.99,
      "currency": "USD",
      "method": "paypal",
      "intent": "sale",
      "description": "ResumeAI Monthly Subscription - 1 month"
    }
    ```
  - **Output**: 
    ```json
    {
      "paymentLink": "https://www.paypal.com/checkoutsession/...",
      "paymentId": "PAYID-123456789"
    }
    ```
  - **Action**: Create PayPal payment and return approval link

### Payment Verification
- [ ] `GET /payment/verify/{paymentId}`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Output**: 
    ```json
    {
      "status": "success",
      "paymentId": "PAYID-123456789",
      "amount": 9.99,
      "currency": "USD",
      "timestamp": "2024-04-20T10:30:00Z"
    }
    ```
  - **Action**: Verify payment with PayPal and update subscription

### Payment History
- [ ] `GET /payment/history`
  - **Headers**: `{ Authorization: Bearer <token> }`
  - **Output**: 
    ```json
    [
      {
        "id": "pay_1",
        "paymentId": "PAYID-123456789",
        "amount": 9.99,
        "currency": "USD",
        "status": "completed",
        "createdAt": "2024-04-20T10:30:00Z"
      }
    ]
    ```
  - **Action**: Return all payments for current user

---

## Database Schema Requirements

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_expiry TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Resumes Table
```sql
CREATE TABLE resumes (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    template_id VARCHAR(255),
    content JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id)
);
```

### Templates Table
```sql
CREATE TABLE templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_pro BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_payment_id (payment_id)
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Security Requirements

- [ ] Implement JWT token validation for all protected routes
- [ ] Use HTTPS/TLS for all API communications
- [ ] Implement rate limiting on payment endpoints
- [ ] Validate all input data (email format, password strength)
- [ ] Hash passwords using bcrypt or similar
- [ ] Encrypt sensitive data at rest
- [ ] Implement CORS properly
- [ ] Use secure headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Implement request validation middleware
- [ ] Add logging and monitoring

---

## Error Handling Standards

All endpoints should return appropriate HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## PayPal Integration Steps

1. [ ] Create PayPal Developer account
2. [ ] Get API credentials (Client ID, Secret)
3. [ ] Install PayPal SDK for your language
4. [ ] Implement payment creation endpoint
5. [ ] Implement payment verification
6. [ ] Set up webhook handlers
7. [ ] Test in sandbox mode
8. [ ] Configure production credentials

### PayPal Sandbox Testing
- Merchant Email: `sb-xxxxx@business.example.com`
- Personal Email: `sb-xxxxx@personal.example.com`
- Password: Provided by PayPal

---

## Testing Endpoints

### With cURL

```bash
# Register user
curl -X POST http://localhost:8080/api/auth/user/register-request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass","name":"User"}'

# Login
curl -X POST http://localhost:8080/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Get profile
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer <token>"

# Get templates
curl -X GET http://localhost:8080/api/resume/templates

# Initiate payment
curl -X POST http://localhost:8080/api/payment/pay \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 9.99,
    "currency": "USD",
    "method": "paypal",
    "intent": "sale",
    "description": "ResumeAI Monthly Subscription"
  }'
```

---

## Deployment Checklist

- [ ] Set environment variables (DB credentials, API keys, JWT secret)
- [ ] Configure CORS for frontend domain
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Test all payment workflows
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Set up CI/CD pipeline

---

## Timeline Estimate

- Authentication: 2-3 days
- User Management: 1-2 days
- Resume Management: 3-4 days
- Payment Integration: 3-4 days
- Testing & Deployment: 3-5 days

**Total: 2-3 weeks**

---

## Support

For questions about the frontend requirements, refer to:
- RESUMEAI_BUILD.md - Feature documentation
- QUICK_START.md - Quick start guide
- PAYMENT_INTEGRATION.md - Payment system details

---

**Frontend is ready for your backend integration!** ✅🚀
