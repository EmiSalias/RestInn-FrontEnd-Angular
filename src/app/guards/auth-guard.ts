import { Injectable }                                   from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router }  from '@angular/router';
import { AuthService }                                  from '../services/auth-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | import('@angular/router').UrlTree {
    if (!this.auth.isLoggedIn()) return this.router.parseUrl('/sign_in');

    const allowed = (route.data['roles'] as string[] | undefined)?.map(r => r.toUpperCase());
    if (!allowed || allowed.length === 0) return true;

    const roles = this.auth.getUserRoles().map(r => r.toUpperCase());
    const hasAccess = roles.some(r => allowed.includes(r));

    return hasAccess ? true : this.router.parseUrl('/unauthorized');
  }
}