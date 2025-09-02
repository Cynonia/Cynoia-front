import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/pages/signin/signin.component').then(m => m.SigninComponent)
      },
       {
         path: 'signup',
         loadComponent: () => import('./modules/auth/pages/signup/signup.component').then(m => m.SignupComponent)
     },
    //   {
    //     path: 'forgot-password',
    //     loadComponent: () => import('./modules/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    //   }
    ]
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./modules/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
//   {
//     path: 'bookings',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./modules/bookings/bookings.routes').then(m => m.bookingsRoutes)
//   },
//   {
//     path: 'events',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./modules/events/events.routes').then(m => m.eventsRoutes)
//   },
//   {
//     path: 'community',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./modules/community/community.routes').then(m => m.communityRoutes)
//   },
//   {
//     path: 'settings',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./modules/settings/settings.routes').then(m => m.settingsRoutes)
//   },
//   {
//     path: 'analytics',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./modules/analytics/analytics.routes').then(m => m.analyticsRoutes)
//   },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];