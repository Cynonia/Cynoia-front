import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards';

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
    path: 'dashboard',
    canActivate: [AuthGuard,RoleGuard],
    loadComponent: () => import('./modules/dashboard/layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/dashboard/pages/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'espaces',
        loadComponent: () => import('./modules/dashboard/pages/espaces/espaces.component').then(m => m.EspacesComponent)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./modules/dashboard/pages/reservations/reservations.component').then(m => m.ReservationsComponent)
      },
      {
        path: 'calendrier',
        loadComponent: () => import('./modules/dashboard/pages/calendrier/calendrier.component').then(m => m.CalendrierComponent)
      },
      {
        path: 'membres',
        loadComponent: () => import('./modules/dashboard/pages/membres/membres.component').then(m => m.MembresComponent)
      },
      {
        path: 'roles-test',
        loadComponent: () => import('./modules/dashboard/pages/roles-test/roles-test.component').then(m => m.RolesTestComponent)
      },
      {
        path: 'finances',
        loadChildren: () => import('./modules/dashboard/pages/finances/finance.routes').then(m => m.financeRoutes)
      },
      {
        path: 'charts-demo',
        loadComponent: () => import('./modules/dashboard/pages/charts-demo/charts-demo.component').then(m => m.ChartsDemoComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./modules/dashboard/pages/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./modules/dashboard/pages/parametres/parametres.component').then(m => m.ParametresComponent)
      }
    ],
    data: { roles: ['ADMIN', 'MANAGER', 'MEMBER'] }
  },

  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  // {
  //   path: '',
  //   redirectTo: '/dashboard',
  //   pathMatch: 'full'
  // },
    {
    path: 'auth/create-organisation',
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/auth/pages/create-organisation/welcome/welcome.component')
          .then(m => m.WelcomeComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./modules/auth/pages/create-organisation/create-organisation.component')
          .then(m => m.CreateOrganisationComponent)
      },
      {
        path: 'branding/logo',
        loadComponent: () => import('./modules/auth/pages/create-organisation/branding/logo/logo.component')
          .then(m => m.BrandingLogoComponent)
      },
      {
        path: 'branding/colors',
        loadComponent: () => import('./modules/auth/pages/create-organisation/branding/colors/colors.component')
          .then(m => m.BrandingColorsComponent)
      },
      {
        path: 'branding/preview',
        loadComponent: () => import('./modules/auth/pages/create-organisation/branding/preview/preview.component')
          .then(m => m.BrandingPreviewComponent)
      }
    ]
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
  
  // Routes pour l'interface workers (membres)
  {
    path: 'workers',
    loadComponent: () => import('./modules/workers/layout/workers-layout.component').then(m => m.WorkersLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'espaces-disponibles',
        pathMatch: 'full'
      },
      {
        path: 'espaces-disponibles',
        loadComponent: () => import('./modules/workers/pages/espaces-disponibles/espaces-disponibles.component').then(m => m.EspacesDisponiblesComponent)
      },
      {
        path: 'detail-espace/:id',
        loadComponent: () => import('./modules/workers/pages/detail-espace/detail-espace.component').then(m => m.DetailEspaceComponent)
      },
      {
        path: 'reservation/:id',
        loadComponent: () => import('./modules/workers/pages/reservation/reservation.component').then(m => m.ReservationComponent)
      },
      {
        path: 'paiement',
        loadComponent: () => import('./modules/workers/pages/paiement/paiement.component').then(m => m.PaiementComponent)
      },
      {
        path: 'confirmation',
        loadComponent: () => import('./modules/workers/pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
      },
      {
        path: 'mes-reservations',
        loadComponent: () => import('./modules/workers/pages/mes-reservations/mes-reservations.component').then(m => m.MesReservationsComponent)
      },
      {
        path: 'historique-paiements',
        loadComponent: () => import('./modules/workers/pages/historique-des-paiements/historique-des-paiements.component').then(m => m.HistoriqueDesPaiementsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./modules/workers/pages/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'historique-reservations',
        loadComponent: () => import('./modules/workers/pages/historique-des-reservations/historique-des-reservations.component').then(m => m.HistoriqueDesReservationsComponent)
      }
    ]
  },

  {
    path: '**',
    redirectTo: '/dashboard'
  }
];