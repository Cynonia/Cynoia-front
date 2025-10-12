import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReservationsService,
  ReservationStats,
} from '../../../../core/services/reservations.service';
import { SpacesService } from '../../../../core/services/spaces.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    <div *ngIf="!isLoading" class="space-y-4 sm:space-y-6">
      <!-- Header -->
      <div class="hidden">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm sm:text-base text-gray-600">Vue d'ensemble de votre espace de coworking</p>
      </div>

      <!-- Stats Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- En attente -->
  <div class="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 h-full">
          <div class="flex items-center min-w-0">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 truncate">
                Réservations en attente
              </h3>
              <div class="flex items-baseline gap-1 sm:gap-2">
                <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {{ stats.enAttente }}
                </p>
                <p class="text-xs text-gray-500">À valider</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmées -->
  <div class="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 h-full">
          <div class="flex items-center min-w-0">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 truncate">
                Réservations confirmées
              </h3>
              <div class="flex items-baseline gap-1 sm:gap-2">
                <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {{ stats.confirmees }}
                </p>
              </div>
            </div>
          </div>
        </div>

  <div class="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 h-full">
          <div class="flex items-center min-w-0">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 truncate">
                Réservations annulées
              </h3>
              <div class="flex items-baseline gap-1 sm:gap-2">
                <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {{ stats.annulees }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Espaces disponibles -->
  <div class="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 h-full">
          <div class="flex items-center min-w-0">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 truncate">
                Espaces disponibles
              </h3>
              <div class="flex items-baseline gap-1 sm:gap-2">
                <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {{ availableSpacesCount }}
                </p>
                <p class="text-xs text-gray-500">Espaces actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Réservations récentes -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div
          class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">
            Réservations récentes
          </h3>
          <a
            routerLink="/dashboard/reservations"
            class="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium">
            Voir tout
          </a>
        </div>
        <div class="p-4 sm:p-6">
          <div *ngIf="recentReservations.length === 0" class="text-center py-8">
            <svg
              class="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm sm:text-base text-gray-600">Aucune réservation récente</p>
          </div>

          <div *ngIf="recentReservations.length > 0" class="space-y-3 sm:space-y-4">
            <div
              *ngFor="let reservation of recentReservations"
              class="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm sm:text-base text-gray-900 truncate">
                  {{ reservation.espace.name }}
                </h4>
                <div class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mt-1 gap-1">
                  <span class="truncate">{{
                    reservation.user?.firstName +
                      ' ' +
                      reservation.user?.lastName || 'Membre inconnu'
                  }}</span>
                  <span class="hidden sm:inline">•</span>
                  <span class="whitespace-nowrap">{{ formatDate(reservation.startAt) }}</span>
                  <span class="hidden sm:inline">•</span>
                  <span class="whitespace-nowrap">{{ formatTime(reservation.startAt) }} - {{ formatTime(reservation.endAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3 sm:flex-shrink-0">
                <span
                  [class]="getStatusBadgeClass(reservation.status)"
                  class="px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap">
                  {{ getStatusLabel(reservation.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
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
  private destroy$ = new Subject<void>();

  constructor(
    private reservationsService: ReservationsService,
    private spacesService: SpacesService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.spacesService.spaces$
      .pipe(takeUntil(this.destroy$))
      .subscribe((spaces) => {
        this.availableSpacesCount = (spaces || []).filter(
          (s) => s.status === true
        ).length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    this.stats = this.reservationsService.getReservationStats();

    this.reservationsService.getReservations().subscribe({
      next: (reservations) => {
        this.stats = this.calculateStats(reservations);

        this.recentReservations = reservations
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((r: any) => {
            const baseDate = r.reservationDate
              ? new Date(r.reservationDate)
              : new Date();

            let startAt = new Date(baseDate);
            let endAt = new Date(baseDate);
            try {
              if (r.startTime) {
                const s = r.startTime.toString().split(':').map(Number);
                if (!isNaN(s[0]))
                  startAt.setHours(s[0], isNaN(s[1]) ? 0 : s[1], 0, 0);
              }

              if (r.endTime) {
                const e = r.endTime.toString().split(':').map(Number);
                if (!isNaN(e[0]))
                  endAt.setHours(e[0], isNaN(e[1]) ? 0 : e[1], 0, 0);
              }

              // If endAt is not after startAt, derive from duration or default to +1h
              if (!r.endTime || endAt <= startAt) {
                if (typeof r.duration === 'number' && r.duration > 0) {
                  endAt = new Date(
                    startAt.getTime() + r.duration * 60 * 60 * 1000
                  );
                } else {
                  endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
                }
              }
            } catch (err) {
              // fallback to sensible defaults
              startAt = new Date(baseDate);
              startAt.setHours(9, 0, 0, 0);
              endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
            }

            return {
              ...r,
              startAt,
              endAt,
            };
          });

        this.availableSpacesCount = this.spacesService
          .getAllSpaces()
          .filter((space) => space.status === true).length;

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
      enAttente: reservations.filter((r) => {
        const s = ReservationsService.normalizeReservationStatus(r.status);
        return s === 'en-attente' || s === 'en-cours';
      }).length,
      confirmees: reservations.filter(
        (r) =>
          ReservationsService.normalizeReservationStatus(r.status) ===
          'confirmee'
      ).length,
      rejetees: reservations.filter(
        (r) =>
          ReservationsService.normalizeReservationStatus(r.status) === 'rejetee'
      ).length,
      annulees: reservations.filter((r) => {
        const s = (r as any).status?.toString().toLowerCase();
        return (
          s === 'annulee' ||
          s === 'cancelled' ||
          s === 'cancel' ||
          s === 'annule'
        );
      }).length,
    };
  }

  formatDate(dateInput: string | Date): string {
    const date =
      dateInput instanceof Date ? dateInput : new Date(dateInput || '');
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  formatTime(dateInput: string | Date): string {
    const date =
      dateInput instanceof Date ? dateInput : new Date(dateInput || '');
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(status: string): string {
    const s = ReservationsService.normalizeReservationStatus(status);
    switch (s) {
      case 'en-attente':
        return 'En attente';
      case 'confirmee':
        return 'Confirmé';
      case 'rejetee':
        return 'Rejeté';
      case 'en-cours':
        return 'En cours';
      default:
        return status;
    }
  }

  getStatusBadgeClass(status: string): string {
    const s = ReservationsService.normalizeReservationStatus(status);
    switch (s) {
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmee':
        return 'bg-green-100 text-green-800';
      case 'rejetee':
        return 'bg-red-100 text-red-800';
      case 'en-cours':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  approveReservation(reservationId: string): void {
    this.reservationsService.acceptReservationApi(reservationId).subscribe({
      next: (res) => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error("Erreur lors de l'acceptation de la réservation :", err);
      },
    });
  }

  rejectReservation(reservationId: string): void {
    this.reservationsService.rejectReservationApi(reservationId).subscribe({
      next: (res) => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur lors du rejet de la réservation :', err);
      },
    });
  }
}