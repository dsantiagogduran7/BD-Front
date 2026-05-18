import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const memberMembresiaGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router  = inject(Router);
  const miembro = session.getPerfilMiembro();
  if (miembro?.membresia_estado === 'activa') return true;
  return router.createUrlTree(['/member/membresias']);
};
