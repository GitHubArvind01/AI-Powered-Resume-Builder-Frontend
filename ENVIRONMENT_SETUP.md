# ResumeAI Frontend - Environment Configuration

## Development Configuration
### File: src/environments/environment.ts

```typescript
export const environment = {
  production: false,
  gatewayUrl: 'http://localhost:8080/api',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  googleRedirectUri: 'http://localhost:4200/auth',
  paypalClientId: 'YOUR_PAYPAL_SANDBOX_CLIENT_ID',
  paypalEnv: 'sandbox'
};
```

## Production Configuration
### File: src/environments/environment.prod.ts

```typescript
export const environment = {
  production: true,
  gatewayUrl: 'https://api.yourdomain.com',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_PROD',
  googleRedirectUri: 'https://yourdomain.com/auth',
  paypalClientId: 'YOUR_PAYPAL_LIVE_CLIENT_ID',
  paypalEnv: 'production'
};
```

## Environment Variables Explained

### API Configuration
- **gatewayUrl**: Your backend API base URL
  - Development: `http://localhost:8080/api`
  - Production: `https://api.yourdomain.com`

### Google OAuth (Optional)
- **googleClientId**: Google OAuth 2.0 Client ID
  - Get from: https://console.cloud.google.com
  - Used for: Social login
- **googleRedirectUri**: Redirect URL after Google authentication
  - Must be registered in Google Console

### PayPal Configuration
- **paypalClientId**: PayPal API Client ID
  - Sandbox: From https://developer.paypal.com
  - Production: Your live PayPal client ID
- **paypalEnv**: Payment environment
  - Development/Testing: `sandbox`
  - Production: `production`

---

## Setup Instructions

### 1. Get Backend URL
From your backend server:
```
Development: http://localhost:8080/api
Production: https://your-api-domain.com
```

### 2. Configure Google OAuth (Optional)
1. Go to: https://console.cloud.google.com
2. Create new OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - http://localhost:4200/auth
   - https://yourdomain.com/auth
4. Copy Client ID to environment files

### 3. Configure PayPal
1. Go to: https://developer.paypal.com
2. Create business account (sandbox for testing)
3. Get Client ID from dashboard
4. Add to environment files

### 4. Update Environment Files
- Replace `YOUR_GOOGLE_CLIENT_ID` with actual values
- Replace `YOUR_PAYPAL_CLIENT_ID_SANDBOX` with actual values
- Update gatewayUrl to your backend URL

---

## Environment File Structure

```
src/environments/
├── environment.ts              # Development config
├── environment.development.ts  # Dev-specific config
├── environment.prod.ts         # Production config
└── .gitignore                  # Ignore sensitive files
```

### Important: Don't Commit Secrets
The `.gitignore` file already includes environment configs. 
To add secrets:
1. Create `.env.local` (not committed)
2. Build with environment-specific configs
3. Use CI/CD for secrets management in production

---

## Development Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Update environment.ts
Edit `src/environments/environment.ts` with local values:
```typescript
export const environment = {
  production: false,
  gatewayUrl: 'http://localhost:8080/api',  // Your local backend
  googleClientId: 'your-dev-client-id',
  googleRedirectUri: 'http://localhost:4200/auth',
  paypalClientId: 'your-paypal-sandbox-id',
  paypalEnv: 'sandbox'
};
```

### Step 3: Start Development Server
```bash
npm start
```

### Step 4: Test Configuration
- Navigate to: http://localhost:4200
- Check browser console for errors
- Verify API calls in Network tab

---

## Production Setup

### Step 1: Update environment.prod.ts
```typescript
export const environment = {
  production: true,
  gatewayUrl: 'https://api.yourdomain.com',
  googleClientId: 'your-prod-client-id',
  googleRedirectUri: 'https://yourdomain.com/auth',
  paypalClientId: 'your-paypal-live-id',
  paypalEnv: 'production'
};
```

### Step 2: Build for Production
```bash
ng build --configuration production
```

### Step 3: Deploy
Upload `dist/` folder to your hosting:
- Vercel, Netlify, AWS, etc.

---

## Testing PayPal Integration

### Sandbox Testing
1. Use sandbox credentials from PayPal Developer
2. Test payment flow in development
3. Use PayPal test accounts provided

### Test Accounts
- **Business Account**: For merchant testing
- **Personal Account**: For buyer testing

Get from: https://developer.paypal.com/dashboard/accounts

---

## API Endpoints Configuration

The frontend will call these endpoints based on your `gatewayUrl`:

### Authentication
- `POST {gatewayUrl}/auth/user/register-request`
- `POST {gatewayUrl}/auth/user/login`
- etc.

### User
- `GET {gatewayUrl}/user/profile`
- etc.

### Resume
- `GET {gatewayUrl}/resume/templates`
- etc.

### Payment
- `POST {gatewayUrl}/payment/pay`
- etc.

Make sure backend is running at the configured `gatewayUrl`.

---

## Troubleshooting

### Issue: "Cannot find module 'environment'"
**Solution**: Ensure environment files exist in `src/environments/`

### Issue: API calls returning 404
**Solution**: 
- Check `gatewayUrl` in environment file
- Verify backend is running
- Check CORS configuration on backend

### Issue: PayPal redirecting to wrong URL
**Solution**:
- Verify `paypalClientId` is correct
- Check redirect URIs in PayPal dashboard
- Ensure environment matches (sandbox vs production)

### Issue: Google login not working
**Solution**:
- Verify `googleClientId` is correct
- Check redirect URI in Google Console
- Ensure HTTPS for production

---

## Development Workflow

### For Local Development
```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend
cd frontend && npm start

# Open: http://localhost:4200
```

### For Production
```bash
# Build for production
ng build --configuration production

# Output: dist/
# Deploy dist/ to hosting
```

---

## Environment Variables Reference

| Variable | Development | Production |
|----------|------------|-----------|
| gatewayUrl | http://localhost:8080/api | https://api.yourdomain.com |
| production | false | true |
| paypalEnv | sandbox | production |

---

## Best Practices

1. ✅ Never commit sensitive credentials
2. ✅ Use different credentials for dev/prod
3. ✅ Store secrets in CI/CD environment
4. ✅ Update URLs before deployment
5. ✅ Test payment flow thoroughly
6. ✅ Monitor API responses
7. ✅ Use HTTPS in production

---

## Support

For configuration issues:
- Check BACKEND_INTEGRATION.md for backend setup
- Verify all URLs are correct
- Check browser console for errors
- Review Network tab in DevTools

---

**Last Updated**: 2024
**Version**: 1.0
