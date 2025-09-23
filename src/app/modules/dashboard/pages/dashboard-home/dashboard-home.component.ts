import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReservationsService,
  ReservationStats,
} from '../../../../core/services/reservations.service';
import { SpacesService } from '../../../../core/services/spaces.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Loader -->
    <div *ngIf="isLoading" class="flex justify-center py-10">
      <div class="flex items-center space-x-2">
        <svg
          class="animate-spin h-6 w-6 text-purple-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <span class="text-gray-600 text-sm">Chargement...</span>
      </div>
    </div>

    <!-- Dashboard content -->
    <div *ngIf="!isLoading" class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Vue d'ensemble de votre espace de coworking</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- En attente -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-700">Réservations en attente</h3>
              <div class="flex items-baseline">
                <p class="text-3xl font-bold text-gray-900">{{ stats.enAttente }}</p>
                <p class="text-sm text-gray-500 ml-2">À valider</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmées -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-700">Réservations confirmées</h3>
              <div class="flex items-baseline">
                <p class="text-3xl font-bold text-gray-900">{{ stats.confirmees }}</p>
                <p class="text-sm text-gray-500 ml-2">Cette semaine</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Espaces disponibles -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-700">Espaces disponibles</h3>
              <div class="flex items-baseline">
                <p class="text-3xl font-bold text-gray-900">{{ availableSpacesCount }}</p>
                <p class="text-sm text-gray-500 ml-2">Espaces actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Réservations récentes -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">Réservations récentes</h3>
          <a routerLink="/dashboard/reservations" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Voir tout
          </a>
        </div>
        <div class="p-6">
          <div *ngIf="recentReservations.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-600">Aucune réservation récente</p>
          </div>

          <div *ngIf="recentReservations.length > 0" class="space-y-4">
            <div *ngFor="let reservation of recentReservations"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">
                  {{ reservation.espace.name }}
                </h4>
                <div class="flex items-center text-sm text-gray-500 mt-1">
                  <span>{{ (reservation.user?.firstName + " " + reservation.user?.lastName ) || 'Membre inconnu' }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDate(reservation.startAt) }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatTime(reservation.startAt) }} - {{ formatTime(reservation.endAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span [class]="getStatusBadgeClass(reservation.status)"
                  class="px-3 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(reservation.status) }}
                </span>
                <button *ngIf="reservation.status === 'en-attente'" (click)="rejectReservation(reservation.id)"
                  class="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Rejeté
                </button>
                <button *ngIf="reservation.status === 'en-attente'" (click)="approveReservation(reservation.id)"
                  class="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  Confirmé
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardHomeComponent implements OnInit {
  stats: ReservationStats = {
    total: 0,
    enAttente: 0,
    confirmees: 0,
    rejetees: 0,
    annulees: 0,
  };

  recentReservations: any[] = [];
  availableSpacesCount = 0;
  isLoading = false;

  constructor(
    private reservationsService: ReservationsService,
    private spacesService: SpacesService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    this.stats = this.reservationsService.getReservationStats();

    this.reservationsService.getReservations().subscribe({
      next: (reservations) => {
        this.stats = this.calculateStats(reservations);

        this.recentReservations = reservations
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        this.availableSpacesCount = this.spacesService
          .getAllSpaces()
          .filter((space) => space.status === 'disponible').length;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réservations', err);
        this.isLoading = false;
      },
    });
  }

  private calculateStats(reservations: any[]): ReservationStats {
    return {
      total: reservations.length,
      enAttente: reservations.filter((r) => r.status === 'en-attente').length,
      confirmees: reservations.filter((r) => r.status === 'confirmee').length,
      rejetees: reservations.filter((r) => r.status === 'rejetee').length,
      annulees: reservations.filter((r) => r.status === 'annulee').length,
    };
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'en-attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmé';
      case 'rejetee':
        return 'Rejeté';
      case 'annulee':
        return 'Annulé';
      default:
        return status;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmee':
        return 'bg-green-100 text-green-800';
      case 'rejetee':
        return 'bg-red-100 text-red-800';
      case 'annulee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  approveReservation(reservationId: string): void {
    this.reservationsService.updateReservationStatus(reservationId, 'confirmee');
    this.loadDashboardData();
  }

  rejectReservation(reservationId: string): void {
    this.reservationsService.updateReservationStatus(reservationId, 'rejetee');
    this.loadDashboardData();
  }
}
