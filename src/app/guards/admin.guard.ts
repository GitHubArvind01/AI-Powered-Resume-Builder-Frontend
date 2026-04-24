import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const adminGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isLoggedIn()) {
    authState.clearSession(false);
    router.navigate(['/auth']);
    return false;
  }

  if (authState.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
