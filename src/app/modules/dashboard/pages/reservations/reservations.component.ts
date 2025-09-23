import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationsService, Reservation, ReservationStats } from '../../../../core/services/reservations.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Validation des réservations</h1>
            <p class="text-gray-600">Gérez les demandes de réservation</p>
          </div>
        </div>
        
        <!-- Notification badge -->
        <div class="flex items-center gap-2 bg-orange-50 text-orange-800 px-4 py-2 rounded-lg">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
          {{ stats.enAttente }} nouvelle{{ stats.enAttente > 1 ? 's' : '' }} demande{{ stats.enAttente > 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Notification de demandes en attente -->
      <div *ngIf="stats.enAttente > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
          <span class="text-orange-800">
            Vous avez <strong>{{ stats.enAttente }} demande{{ stats.enAttente > 1 ? 's' : '' }}</strong> de réservation en attente de validation.
          </span>
        </div>
      </div>

      <!-- Onglets -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8">
          <button 
            *ngFor="let tab of tabs"
            (click)="setActiveTab(tab.key)"
            [class]="getTabClass(tab.key)"
            class="py-3 px-1 border-b-2 font-medium text-sm transition-colors">
            {{ tab.label }}
            <span *ngIf="tab.count > 0" 
                  [class]="getTabBadgeClass(tab.key)"
                  class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="min-h-96">
        <!-- En attente -->
        <div *ngIf="activeTab === 'en-attente'">
          <div *ngIf="pendingReservations.length > 0; else emptyPending">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">Demandes en attente de validation</h2>
              <p class="text-gray-600">Cliquez sur "Accepter" ou "Rejeter" pour traiter chaque demande</p>
            </div>
            
            <div class="space-y-4">
              <div *ngFor="let reservation of pendingReservations" 
                   class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <!-- Header avec l'espace et statut -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <ng-container *ngIf="reservation.space?.image; else defaultIcon">
                        <img [src]="reservation.space?.image!" 
                             [alt]="reservation.space?.name || 'Espace'"
                             class="w-full h-full object-cover">
                      </ng-container>
                      <ng-template #defaultIcon>
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                      </ng-template>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ reservation.space?.name || 'Espace inconnu' }}</h3>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        En attente
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex gap-2">
                    <button 
                      (click)="acceptReservation(reservation)"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Accepter
                    </button>
                    <button 
                      (click)="rejectReservation(reservation)"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Rejeter
                    </button>
                  </div>
                </div>

                <!-- Détails de la réservation -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span>Membre : {{ reservation.user?.firstName + " "+ reservation.user?.lastName }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(reservation.startAt) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Créneau :  {{ formatTime(reservation.startAt) + " - " +  formatTime(reservation.endAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #emptyPending>
            <div class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune demande en attente</h3>
              <p class="text-gray-600 mb-6">Toutes les réservations ont été traitées</p>
            </div>
          </ng-template>
        </div>

        <!-- Confirmées -->
        <div *ngIf="activeTab === 'confirmees'">
          <div *ngIf="confirmedReservations.length > 0; else emptyConfirmed">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">Réservations confirmées</h2>
              <p class="text-gray-600">Liste des réservations acceptées</p>
            </div>
            
            <div class="space-y-4">
              <div *ngFor="let reservation of confirmedReservations" 
                   class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <ng-container *ngIf="reservation.space?.image; else defaultIcon2">
                        <img [src]="reservation.espace?.images" 
                             [alt]="reservation.espace?.name || 'Espace'"
                             class="w-full h-full object-cover">
                      </ng-container>
                      <ng-template #defaultIcon2>
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                      </ng-template>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ reservation.espace?.name || 'Espace inconnu' }}</h3>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmé
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span>Membre : {{ reservation.user?.firstName + " "+ reservation.user?.lastName }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(reservation.startAt) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Créneau :  {{ formatTime(reservation.startAt) + " - " +  formatTime(reservation.endAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #emptyConfirmed>
            <div class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune réservation confirmée</h3>
              <p class="text-gray-600 mb-6">Les réservations confirmées apparaîtront ici</p>
            </div>
          </ng-template>
        </div>

        <!-- Rejetées -->
        <div *ngIf="activeTab === 'rejetees'">
          <div *ngIf="rejectedReservations.length > 0; else emptyRejected">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">Réservations rejetées</h2>
              <p class="text-gray-600">Liste des réservations refusées</p>
            </div>
            
            <div class="space-y-4">
              <div *ngFor="let reservation of rejectedReservations" 
                   class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <ng-container *ngIf="reservation.space?.image; else defaultIcon3">
                        <img [src]="reservation.space?.image!" 
                             [alt]="reservation.space?.name || 'Espace'"
                             class="w-full h-full object-cover">
                      </ng-container>
                      <ng-template #defaultIcon3>
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                      </ng-template>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ reservation.space?.name || 'Espace inconnu' }}</h3>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Rejeté
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span>Membre : {{ reservation.user?.firstName + " " + reservation.user?.lastName }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(reservation.startAt) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Créneau : {{ formatTime(reservation.startAt) + " - " +  formatTime(reservation.endAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #emptyRejected>
            <div class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune réservation rejetée</h3>
              <p class="text-gray-600 mb-6">Les réservations rejetées apparaîtront ici</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Boutons de navigation en bas -->
      <div class="flex justify-center gap-4 pt-8 border-t border-gray-200">
        <button 
          (click)="navigateToCalendar()"
          class="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Voir le calendrier
        </button>
        
        <button 
          (click)="navigateToSpaces()"
          class="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Gérer les espaces
        </button>
      </div>
    </div>
  `,
})
export class ReservationsComponent implements OnInit {
  activeTab: 'en-attente' | 'confirmees' | 'rejetees' = 'en-attente';

  allReservations: Reservation[] = [];
  pendingReservations: Reservation[] = [];
  confirmedReservations: Reservation[] = [];
  rejectedReservations: Reservation[] = [];

  stats: ReservationStats = {
    total: 0,
    enAttente: 0,
    confirmees: 0,
    rejetees: 0,
    annulees: 0
  };

  tabs = [
    { key: 'en-attente' as const, label: 'En attente', count: 0 },
    { key: 'confirmees' as const, label: 'Confirmées', count: 0 },
    { key: 'rejetees' as const, label: 'Rejetées', count: 0 }
  ];

  constructor(
    private reservationsService: ReservationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reservationsService.getReservations().subscribe(reservations => {
      this.allReservations = reservations;

      this.pendingReservations = reservations.filter(r => r.status === 'en-attente');
      this.confirmedReservations = reservations.filter(r => r.status === 'confirmee');
      this.rejectedReservations = reservations.filter(r => r.status === 'rejetee');

      this.stats = {
        total: reservations.length,
        enAttente: this.pendingReservations.length,
        confirmees: this.confirmedReservations.length,
        rejetees: this.rejectedReservations.length,
        annulees: reservations.filter(r => r.status === 'annulee').length
      };

      this.updateTabCounts();
    });
  }

  updateTabCounts(): void {
    this.tabs[0].count = this.stats.enAttente;
    this.tabs[1].count = this.stats.confirmees;
    this.tabs[2].count = this.stats.rejetees;
  }

  setActiveTab(tab: 'en-attente' | 'confirmees' | 'rejetees'): void {
    this.activeTab = tab;
  }

  getTabClass(tabKey: string): string {
    const baseClass = 'py-3 px-1 border-b-2 font-medium text-sm transition-colors';
    if (tabKey === this.activeTab) {
      return `${baseClass} border-purple-500 text-purple-600`;
    }
    return `${baseClass} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }

  getTabBadgeClass(tabKey: string): string {
    switch (tabKey) {
      case 'en-attente':
        return 'bg-red-100 text-red-800';
      case 'confirmees':
        return 'bg-green-100 text-green-800';
      case 'rejetees':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  acceptReservation(reservation: Reservation): void {
    if (confirm(`Confirmer la réservation de ${reservation.member.name} pour ${reservation.space?.name} ?`)) {
      const result = this.reservationsService.acceptReservation(reservation.id);
    }
  }

  rejectReservation(reservation: Reservation): void {
    const reason = prompt('Raison du rejet (optionnel):');
    if (reason !== null) {
      const result = this.reservationsService.rejectReservation(reservation.id, reason || undefined);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  navigateToCalendar(): void {
    this.router.navigate(['/dashboard/calendrier']);
  }

  navigateToSpaces(): void {
    this.router.navigate(['/dashboard/espaces']);
  }
}
