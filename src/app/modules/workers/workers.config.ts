export interface WorkersNavItem {
  title: string;
  path: string;
  icon?: string; // optional name, we keep SVGs inline in template
  showBadge?: boolean;
  badgeValueKey?: string; // key on component to read dynamic badge values
}

export const WORKERS_NAV: WorkersNavItem[] = [
  { title: 'Espaces disponibles', path: '/workers/espaces-disponibles' , showBadge: false},
  { title: 'Mes réservations', path: '/workers/mes-reservations', showBadge: true, badgeValueKey: 'reservationsCount' },
  { title: 'Messages', path: '/workers/messages', showBadge: false },
  { title: 'Historique des paiements', path: '/workers/historique-paiements', showBadge: false },
  { title: 'Historique des réservations', path: '/workers/historique-reservations', showBadge: false }
];