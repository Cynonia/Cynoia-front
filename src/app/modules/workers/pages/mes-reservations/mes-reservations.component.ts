import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes réservations</h1>
        <p class="text-gray-600">Gérez vos espaces réservés</p>
      </div>

      <!-- Navigation temporelle -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button 
            (click)="navigateMonth(-1)"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <h2 class="text-lg font-semibold text-gray-900">{{ currentMonthLabel }}</h2>
          
          <button 
            (click)="navigateMonth(1)"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Filtres de vue -->
        <div class="flex items-center gap-2">
          <button 
            *ngFor="let view of viewTypes"
            (click)="setViewType(view.key)"
            [class]="currentView === view.key ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border-gray-300'"
            class="px-3 py-1 text-sm font-medium border rounded-lg transition-colors hover:bg-gray-50">
            {{ view.label }}
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ stats.aVenir }}</div>
          <div class="text-sm text-gray-600">À venir</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.confirmees }}</div>
          <div class="text-sm text-gray-600">Confirmées</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ stats.enAttente }}</div>
          <div class="text-sm text-gray-600">En attente</div>
        </div>
      </div>

      <!-- Historique des réservations -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Historique des réservations</h3>
        
        <div class="space-y-3">
          <div *ngFor="let reservation of reservations" 
               class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            
            <!-- Icône espace -->
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              
              <div>
                <h4 class="font-medium text-gray-900">{{ reservation.spaceName }}</h4>
                <p class="text-sm text-gray-600">{{ reservation.dateLabel }} • {{ reservation.timeRange }}</p>
              </div>
            </div>
            
            <!-- Statut -->
            <div class="flex items-center gap-3">
              <span 
                [class]="getStatusClass(reservation.status)"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                {{ getStatusLabel(reservation.status) }}
              </span>
              
              <!-- Actions selon le statut -->
              <div class="flex gap-2">
                <button *ngIf="reservation.status === 'pending'" 
                        (click)="cancelReservation(reservation.id)"
                        class="text-red-600 hover:text-red-700 text-sm font-medium">
                  Annuler
                </button>
                
                <button *ngIf="reservation.status === 'confirmed'" 
                        (click)="viewReservation(reservation.id)"
                        class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="reservations.length === 0" 
             class="text-center py-12 text-gray-500">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6-6m0 6l-6-6"/>
          </svg>
          <p>Aucune réservation trouvée</p>
          <button 
            (click)="goToSpaces()"
            class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Découvrir les espaces
          </button>
        </div>
      </div>
    </div>
  `
})
export class MesReservationsComponent implements OnInit {
  // Navigation temporelle
  currentDate = new Date(2025, 8); // septembre 2025
  currentView = 'month';
  
  viewTypes = [
    { key: 'day', label: 'Jour' },
    { key: 'week', label: 'Semaine' }, 
    { key: 'month', label: 'Mois' }
  ];
  
  // Statistiques
  stats = {
    aVenir: 0,
    confirmees: 2, 
    enAttente: 1
  };

  reservations: any[] = [
    {
      id: 1,
      spaceName: 'Bureau privé 101',
      dateLabel: 'lun. 20 janv.',
      timeRange: '10:00-17:00',
      status: 'confirmed'
    },
    {
      id: 2,
      spaceName: 'Salle de réunion Alpha',
      dateLabel: 'ven. 17 janv.',
      timeRange: '14:00-16:00',
      status: 'pending'
    },
    {
      id: 3,
      spaceName: 'Bureau privé 101',
      dateLabel: 'jeu. 16 janv.',
      timeRange: '09:00-12:00',
      status: 'confirmed'
    },
    {
      id: 4,
      spaceName: 'Projecteur HD',
      dateLabel: 'dim. 12 janv.',
      timeRange: '19:00-12:00',
      status: 'cancelled'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadReservations();
    this.updateStats();
  }

  get currentMonthLabel(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  navigateMonth(direction: number) {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    this.currentDate = newDate;
  }

  setViewType(view: string) {
    this.currentView = view;
  }

  loadReservations() {
    // Récupération depuis localStorage ou API
    const stored = localStorage.getItem('userReservations');
    if (stored) {
      const savedReservations = JSON.parse(stored);
      this.reservations = [...this.reservations, ...savedReservations];
    }
  }

  updateStats() {
    this.stats.confirmees = this.reservations.filter(r => r.status === 'confirmed').length;
    this.stats.enAttente = this.reservations.filter(r => r.status === 'pending').length;
    this.stats.aVenir = this.reservations.filter(r => r.status === 'upcoming').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'upcoming': return 'À venir';
      default: return 'Inconnue';
    }
  }

  cancelReservation(id: number) {
    const reservation = this.reservations.find(r => r.id === id);
    if (reservation && confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      reservation.status = 'cancelled';
      this.updateStats();
      localStorage.setItem('userReservations', JSON.stringify(this.reservations));
    }
  }

  viewReservation(id: number) {
    // Navigation vers les détails de la réservation
    console.log('Voir réservation:', id);
  }

  goToSpaces() {
    this.router.navigate(['/workers/espaces-disponibles']);
  }
}