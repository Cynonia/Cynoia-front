import { Routes } from '@angular/router';

export const financeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./analyse-financiere.component').then(c => c.AnalyseFinanciereComponent)
  },
  {
    path: 'paiements',
    loadComponent: () => import('./paiements-historique.component').then(c => c.PaiementsHistoriqueComponent)
  }
];