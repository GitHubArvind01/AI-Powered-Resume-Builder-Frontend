# Payment Integration Guide

## Overview

The ResumeAI platform includes a complete payment flow integrated with PayPal. This guide explains how the payment system works and how to integrate it with your backend.

## Payment Flow Architecture

### 1. Frontend Payment Initiation

**File**: `src/app/components/payment/payment.component.ts`

The payment component handles:
- Plan selection (Monthly: $9.99 or Yearly: $89.99)
- Payment method selection (PayPal or Credit Card)
- Order summary calculation
- Error handling

### 2. Backend Integration

Your backend should expose a payment endpoint:

```
POST /payment/pay
```

**Request Format**:
```json
{
  "price": 9.99,
  "currency": "USD",
  "method": "paypal",
  "intent": "sale",
  "description": "ResumeAI Monthly Subscription - 1 month"
}
```

**Response Format**:
```json
{
  "paymentLink": "https://www.paypal.com/checkoutsession/...",
  "paymentId": "pay_123456789"
}
```

### 3. Payment Service

**File**: `src/app/services/payment.service.ts`

```typescript
// Initiate payment
this.paymentService.initiatePayment(paymentRequest).subscribe(
  response => {
    if (response.paymentLink) {
      // Redirect to PayPal
      window.location.href = response.paymentLink;
    }
  },
  error => console.error('Payment error:', error)
);
```

## Implementation Steps

### Backend Setup (Spring Boot Example)

#### 1. PayPal Configuration

```java
@Configuration
public class PayPalConfig {
    @Value("${paypal.client.id}")
    private String clientId;
    
    @Value("${paypal.client.secret}")
    private String clientSecret;
    
    public APIContext apiContext() {
        return new APIContext(clientId, clientSecret, "sandbox");
    }
}
```

#### 2. Payment Controller

```java
@RestController
@RequestMapping("/payment")
@CrossOrigin
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping("/pay")
    public ResponseEntity<PaymentResponse> initiatePayment(@RequestBody PaymentRequest request) {
        try {
            PaymentResponse response = paymentService.createPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
```

#### 3. Payment Service

```java
@Service
public class PaymentService {
    
    @Autowired
    private APIContext apiContext;
    
    public PaymentResponse createPayment(PaymentRequest request) throws PayPalRESTException {
        // Create PayPal payment
        Payment payment = new Payment();
        payment.setIntent(request.getIntent());
        payment.setPayer(createPayer());
        payment.setTransactions(createTransactionList(request));
        payment.setRedirectUrls(createRedirectUrls());
        
        // Execute payment
        Payment createdPayment = payment.create(apiContext);
        
        // Extract approval link
        String approvalLink = createdPayment.getLinks().stream()
            .filter(l -> l.getRel().equals("approval_url"))
            .map(Links::getHref)
            .findFirst()
            .orElse(null);
        
        return new PaymentResponse(approvalLink, createdPayment.getId());
    }
    
    private Payer createPayer() {
        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");
        return payer;
    }
    
    private List<Transaction> createTransactionList(PaymentRequest request) {
        Transaction transaction = new Transaction();
        transaction.setDescription(request.getDescription());
        transaction.setAmount(createAmount(request));
        return Arrays.asList(transaction);
    }
    
    private Amount createAmount(PaymentRequest request) {
        Amount amount = new Amount();
        amount.setCurrency(request.getCurrency());
        amount.setTotal(String.format("%.2f", request.getPrice()));
        return amount;
    }
    
    private RedirectUrls createRedirectUrls() {
        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl("https://yourdomain.com/payment/cancel");
        redirectUrls.setReturnUrl("https://yourdomain.com/payment/success");
        return redirectUrls;
    }
}
```

### Frontend Implementation

#### 1. Payment Component Usage

The payment component is already configured in your app. Users navigate to `/payment` route to:
1. Select a plan
2. Choose payment method
3. Initiate payment
4. Get redirected to PayPal

#### 2. Payment Success Handling

After user completes payment on PayPal, they're redirected to your success URL with `paymentId` parameter.

Create an endpoint to handle payment verification:

```typescript
// Add this to your payment service
verifyPayment(paymentId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/verify/${paymentId}`);
}
```

Backend endpoint:
```java
@GetMapping("/verify/{paymentId}")
public ResponseEntity<PaymentVerification> verifyPayment(@PathVariable String paymentId) {
    PaymentVerification verification = paymentService.verifyPayment(paymentId);
    
    if (verification.isSuccess()) {
        // Upgrade user to premium
        userService.upgradeToPremium(getCurrentUserId());
    }
    
    return ResponseEntity.ok(verification);
}
```

#### 3. Update User Plan

After successful payment verification:

```typescript
// Update user service to mark as pro
this.userService.upgradeToPremium().subscribe(
  () => {
    // Redirect to dashboard
    this.router.navigate(['/dashboard']);
  }
);
```

## Database Schema (Example)

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    payment_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    status VARCHAR(50),
    payment_method VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    plan VARCHAR(50),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Payment Plans

### Free Plan
- 5 free templates
- Basic editor
- PDF download only
- No ATS check

### Pro Plan ($9.99/month or $89.99/year - saves 25%)
- 30+ premium templates
- Advanced editor with AI suggestions
- PDF & DOCX export
- ATS optimization and scoring
- Priority support
- Unlimited resume creation
- Custom branding options

## Environment Variables

Add these to your backend `.env`:

```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production
PAYMENT_SUCCESS_URL=https://yourdomain.com/payment/success
PAYMENT_CANCEL_URL=https://yourdomain.com/payment/cancel
```

## Error Handling

The frontend handles various payment errors:
- Network errors
- Invalid payment data
- User cancellation
- Payment failures

All errors are displayed to the user with clear messages.

## Testing

### PayPal Sandbox Account

For testing, use PayPal's sandbox environment:
1. Create a sandbox account at https://developer.paypal.com
2. Use sandbox API credentials
3. Test with sandbox payment accounts

### Test Cases

1. **Successful Payment**: Complete payment flow
2. **Failed Payment**: Handle payment rejection
3. **Cancelled Payment**: User cancels on PayPal
4. **Network Error**: Handle connection issues
5. **Invalid Data**: Handle malformed requests

## Security Considerations

1. **Token Validation**: Always validate JWT tokens on backend
2. **Amount Verification**: Verify payment amount matches database record
3. **HTTPS**: Use HTTPS for all payment requests
4. **Rate Limiting**: Implement rate limiting on payment endpoints
5. **Data Encryption**: Encrypt sensitive payment data
6. **PCI Compliance**: Ensure compliance with PCI DSS standards

## Webhook Setup (Optional but Recommended)

For better payment tracking, implement PayPal webhooks:

```java
@PostMapping("/webhook")
public ResponseEntity<Void> handleWebhook(@RequestBody WebhookEvent event) {
    String eventType = event.getEventType();
    
    if ("PAYMENT.CAPTURE.COMPLETED".equals(eventType)) {
        // Update subscription status
        updateSubscription(event);
    }
    
    return ResponseEntity.ok().build();
}
```

## Troubleshooting

### Payment Link Not Generated
- Verify API credentials
- Check PayPal API status
- Ensure request format is correct

### User Not Upgraded After Payment
- Check payment verification logic
- Verify database transaction completion
- Check user session refresh

### Redirect Issues
- Verify redirect URLs match PayPal settings
- Check CORS configuration
- Ensure SSL certificates are valid

## Support

For PayPal integration issues, refer to:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal REST API Reference](https://developer.paypal.com/api/rest/)
- [PayPal Checkout Integration](https://developer.paypal.com/docs/checkout/)

---

**Last Updated**: 2024
**Version**: 1.0
