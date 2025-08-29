import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRoles = route.data['roles'] as string[];
    const requiredPermissions = route.data['permissions'] as string[];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return this.router.createUrlTree(['/auth/signin']);
        }

        // Check roles
        if (requiredRoles && !requiredRoles.includes(user.role)) {
          return this.router.createUrlTree(['/dashboard']);
        }

        // Check permissions
        if (requiredPermissions && !this.hasPermissions(user.permissions, requiredPermissions)) {
          return this.router.createUrlTree(['/dashboard']);
        }

        return true;
      })
    );
  }

  private hasPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }
}