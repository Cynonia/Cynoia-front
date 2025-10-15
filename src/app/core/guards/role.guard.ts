import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRoles = route.data['roles'] as string[];
    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          // Not authenticated, redirect to login
          return this.router.createUrlTree(['/auth/login']);
        }
        if (
          !requiredRoles ||
          requiredRoles.length === 0 ||
          requiredRoles.includes(user.role)
        ) {
          return true;
        }

        if (user.role === 'CLIENT') {
          return this.router.createUrlTree(['/workers']);
        }
        // Role not allowed, redirect to 404 page
        return this.router.createUrlTree(['/404']);
      })
    );
  }
}
