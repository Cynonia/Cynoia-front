import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalService } from '../../../../core/services/modal.service';
import { ReservationsService } from '../../../../core/services/reservations.service';
import { CalendarService, CalendarEvent, CalendarWeek, CalendarDay, TimeSlot } from '../../../../core/services/calendar.service';

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes réservations</h1>
        <p class="text-gray-600">Gérez vos espaces réservés</p>
      </div>

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

        <div class="flex items-center gap-2">
          <button 
            *ngFor="let view of viewTypes"
            (click)="setViewType(view.key)"
            [class]="currentView === view.key ? 'btn-primary text-white' : 'bg-white text-gray-700 border-gray-300'"
            class="px-3 py-1 text-sm font-medium border rounded-lg transition-colors hover:bg-gray-50">
            {{ view.label }}
          </button>
        </div>
      </div>

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

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div *ngIf="currentView === 'month'">
          <div class="grid grid-cols-7 gap-1 text-sm text-gray-600 mb-2">
            <div class="text-center font-medium">Lun</div>
            <div class="text-center font-medium">Mar</div>
            <div class="text-center font-medium">Mer</div>
            <div class="text-center font-medium">Jeu</div>
            <div class="text-center font-medium">Ven</div>
            <div class="text-center font-medium">Sam</div>
            <div class="text-center font-medium">Dim</div>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <ng-container *ngFor="let week of monthWeeks">
              <ng-container *ngFor="let day of week.days">
                <div [class]="day.isCurrentMonth ? 'p-2 border rounded-lg' : 'p-2 border rounded-lg opacity-50'">
                  <div class="text-xs font-medium mb-1">{{ day.date.getDate() }}</div>
                  <div *ngFor="let ev of day.events" class="text-xs p-1 mb-1 rounded" [style.background]="ev.color">
                    <div class="truncate text-white text-xs">{{ ev.title }} - {{ ev.spaceName }}</div>
                  </div>
                </div>
              </ng-container>
            </ng-container>
          </div>
        </div>

        <div *ngIf="currentView === 'week'">
          <div class="flex gap-2">
            <div *ngFor="let day of weekDays" class="flex-1 border rounded-lg p-2">
              <div class="font-medium text-sm">{{ day.date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }) }}</div>
              <div *ngFor="let ev of day.events" class="text-xs p-1 mt-1 rounded" [style.background]="ev.color">
                <div class="text-white">{{ ev.title }} — {{ formatTimeRange(ev.start, ev.end) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="currentView === 'day'">
          <div class="space-y-1">
            <div *ngFor="let slot of daySlots" class="p-2 border rounded-lg">
              <div class="text-xs text-gray-600">{{ slot.hour }}:00</div>
              <div *ngFor="let ev of slot.events" class="text-sm p-1 mt-1 rounded" [style.background]="ev.color">
                <div class="text-white">{{ ev.title }} — {{ formatTimeRange(ev.start, ev.end) }}</div>
              </div>
            </div>
          </div>
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
                <button *ngIf="reservation.status === 'en-attente'" 
                        (click)="cancelReservation(reservation.id)"
                        class="text-red-600 hover:text-red-700 text-sm font-medium">
                  Annuler
                </button>
                
                <button *ngIf="reservation.status === 'confirmee'" 
                        (click)="viewReservation(reservation.id)"
                        class="text-primary hover:text-opacity-90 text-sm font-medium">
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
            class="mt-4 px-4 py-2 btn-primary text-white rounded-lg hover:brightness-90 transition-colors">
            Découvrir les espaces
          </button>
        </div>
      </div>
    </div>
  `
})
export class MesReservationsComponent implements OnInit {
  // Navigation temporelle driven by CalendarService
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

  // reservations used for list UI (flattened calendar events)
  reservations: any[] = [];

  // Raw events from calendar
  private calendarEvents: CalendarEvent[] = [];
  // Data for template calendar views
  monthWeeks: CalendarWeek[] = [];
  weekDays: CalendarDay[] = [];
  daySlots: TimeSlot[] = [];
  // Helper used by template to check current view
  get currentView(): string {
    return this.calendarService.getCurrentView();
  }

  constructor(
    private router: Router,
    private modal: ModalService,
    private reservationsService: ReservationsService,
    private calendarService: CalendarService
  ) {}

  // Template helpers that delegate to CalendarService
  formatTimeRange(start: Date, end: Date): string {
    return this.calendarService.formatTimeRange(start, end);
  }

  formatTime(date: Date): string {
    return this.calendarService.formatTime(date);
  }

  ngOnInit() {
    // Récupère le userId courant
    const userId = this.reservationsService['authService']?.currentUser?.id;
    if (userId) {
      this.reservationsService.getReservationsByUserId(userId).subscribe(() => {
        this.updateDisplayedReservations();
      });
    }
    // React to calendar navigation/view changes and recompute displayed reservations
    this.calendarService.currentDate$.subscribe(() => this.updateDisplayedReservations());
    this.calendarService.currentView$.subscribe(() => this.updateDisplayedReservations());
  }

  get currentMonthLabel(): string {
    return this.calendarService.formatMonthYear(this.calendarService.getCurrentDate());
  }

  navigateMonth(direction: number) {
    if (direction < 0) this.calendarService.goToPreviousPeriod();
    else this.calendarService.goToNextPeriod();
  }

  setViewType(view: string) {
    this.calendarService.setCurrentView(view as any);
  }

  loadReservations() {
    // LocalStorage usage removed: reservations now come from ReservationsService
  }

  updateStats() {
    this.stats.confirmees = this.reservations.filter(r => r.status === 'confirmee').length;
    this.stats.enAttente = this.reservations.filter(r => r.status === 'en-attente' || r.status === 'en-cours').length;
    this.stats.aVenir = this.reservations.filter(r => r.status === 'en-cours').length;
  }

  getStatusClass(status: string): string {
    const s = ReservationsService.normalizeReservationStatus(status);
    switch (s) {
      case 'confirmee': return 'bg-green-100 text-green-700';
      case 'en-attente': return 'bg-orange-100 text-orange-700';
      case 'rejetee': return 'bg-red-100 text-red-700';
      case 'en-cours': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: string): string {
    const s = ReservationsService.normalizeReservationStatus(status);
    switch (s) {
      case 'confirmee': return 'Confirmée';
      case 'en-attente': return 'En attente';
      case 'rejetee': return 'Annulée';
      case 'en-cours': return 'À venir';
      default: return 'Inconnue';
    }
  }

  async cancelReservation(id: number) {
    const reservation = this.reservations.find(r => r.id === id);
    if (!reservation) return;
    const ok = await this.modal.confirm({
      title: 'Annuler la réservation',
      message: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
      confirmText: 'Oui, annuler',
      cancelText: 'Annuler'
    });
    if (ok) {
  reservation.status = 'rejetee';
      this.updateStats();
      // Persisting via API is expected; refresh from API to reflect server state
      this.reservationsService.refreshFromApi();
    }
  }

  private formatDateLabel(date: any): string {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  }

  private updateDisplayedReservations(): void {
    const view = this.calendarService.getCurrentView();
    const date = this.calendarService.getCurrentDate();
    let events: CalendarEvent[] = [];

    switch (view) {
      case 'month': {
        const weeks = this.calendarService.getMonthData(date);
        this.monthWeeks = weeks;
        events = weeks.flatMap(w => w.days.flatMap(d => d.events));
        break;
      }
      case 'week': {
        const days = this.calendarService.getWeekData(date);
        this.weekDays = days;
        events = days.flatMap(d => d.events);
        break;
      }
      case 'day': {
        const slots = this.calendarService.getDayData(date);
        this.daySlots = slots;
        events = slots.flatMap(s => s.events);
        break;
      }
      default:
        events = [];
    }

    // Map CalendarEvent into UI reservation list shape
    this.reservations = events.map(e => ({
      id: e.id,
      spaceName: e.spaceName,
      dateLabel: this.formatDateLabel(e.start),
      timeRange: this.calendarService.formatTimeRange(e.start, e.end),
      status: e.status
    }));

    this.updateStats();
  }

  private mapStatus(status: string): string {
    // Return canonical French status keys for the UI
    return ReservationsService.normalizeReservationStatus(status);
  }

  viewReservation(id: number) {
    // Navigation vers les détails de la réservation
    console.log('Voir réservation:', id);
  }

  goToSpaces() {
    this.router.navigate(['/workers/espaces-disponibles']);
  }
}