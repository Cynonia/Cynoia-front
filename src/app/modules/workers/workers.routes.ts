import { Routes } from '@angular/router';
import { WorkersLayoutComponent } from './layout/workers-layout.component';

export const workersRoutes: Routes = [
  {
    path: '',
    component: WorkersLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'espaces-disponibles',
        pathMatch: 'full'
      },
      {
        path: 'espaces-disponibles',
        loadComponent: () => import('./pages/espaces-disponibles/espaces-disponibles.component').then(m => m.EspacesDisponiblesComponent)
      },
      {
        path: 'detail-espace/:id',
        loadComponent: () => import('./pages/detail-espace/detail-espace.component').then(m => m.DetailEspaceComponent)
      },
      {
        path: 'reservation/:id',
        loadComponent: () => import('./pages/reservation/reservation.component').then(m => m.ReservationComponent)
      },
      {
        path: 'paiement',
        loadComponent: () => import('./pages/paiement/paiement.component').then(m => m.PaiementComponent)
      },
      {
        path: 'confirmation',
        loadComponent: () => import('./pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
      },
      {
        path: 'mes-reservations',
        loadComponent: () => import('./pages/mes-reservations/mes-reservations.component').then(m => m.MesReservationsComponent)
      },
      {
        path: 'historique-paiements',
        loadComponent: () => import('./pages/historique-des-paiements/historique-des-paiements.component').then(m => m.HistoriqueDesPaiementsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('../dashboard/pages/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'historique-reservations',
        loadComponent: () => import('./pages/historique-des-reservations/historique-des-reservations.component').then(m => m.HistoriqueDesReservationsComponent)
      }
    ]
  }
];