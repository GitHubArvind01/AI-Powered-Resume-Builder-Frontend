import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.responseType === 'blob' && error.error instanceof Blob) {
        return throwError(() => error);
      }

      let userFriendlyMsg = '';

      if (error.status === 0) {
        userFriendlyMsg = 'The server is unreachable. Check your connection.';
      } else if (error.error?.message) {
        // Matches your Java ErrorResponse.message
        userFriendlyMsg = error.error.message;
      } else if (typeof error.error === 'string' && error.error.trim()) {
        userFriendlyMsg = error.error;
      } else {
        userFriendlyMsg = `Error: ${error.statusText}`;
      }

      // You can also log to a service like Sentry here
      return throwError(() => new Error(userFriendlyMsg));
    })
  );
};
