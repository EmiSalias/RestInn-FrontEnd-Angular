import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in']);
      return false;
    }

    const allowedRoles = route.data['roles'] as string[] | undefined;
    const userRole = this.auth.getUserRole();

    const hasAccess = !allowedRoles || (userRole !== null && allowedRoles.includes(userRole));

    if (hasAccess) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}