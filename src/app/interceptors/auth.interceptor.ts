import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';

/**
 * URLs where a 401/403 response must NOT trigger a session clear.
 *
 * - /users/me  – called during app-init; can transiently fail on cold start
 * - /payments/verify – called right after PayPal redirect; token is valid
 */
const SKIP_LOGOUT_URLS = ['/users/me', '/payments/verify'];

function shouldSkipLogout(url: string): boolean {
  return SKIP_LOGOUT_URLS.some(path => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const token = authState.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only clear the session (and redirect to /auth) when:
      //  1. The response is 401 (Unauthorized)
      //  2. The request is NOT one of the safe/payment-flow endpoints
      if (
        (error.status === 401 || error.status === 403) &&
        !shouldSkipLogout(req.url)
      ) {
        authState.clearSession();
      }
      return throwError(() => error);
    })
  );
};
