import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService, CalendarView, CalendarDay, CalendarWeek, TimeSlot, CalendarEvent } from '../../../../core/services/calendar.service';
import { Space } from '../../../../core/services/spaces.service';

@Component({
  selector: 'app-calendrier',
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
            <h1 class="text-2xl font-bold text-gray-900">Calendrier interactif</h1>
            <p class="text-gray-600">Vue d'ensemble des réservations</p>
          </div>
        </div>
      </div>

      <!-- Contrôles de navigation et filtres -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Navigation temporelle -->
          <div class="flex items-center gap-4">
            <button 
              (click)="goToPrevious()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <div class="text-center min-w-0">
              <h2 class="text-lg font-semibold text-gray-900">{{ getFormattedPeriod() }}</h2>
            </div>

            <button 
              (click)="goToNext()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <button 
              (click)="goToToday()"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Aujourd'hui
            </button>
          </div>

          <!-- Filtres et vues -->
          <div class="flex items-center gap-4">
            <!-- Filtre par espace -->
            <div class="relative">
              <button 
                (click)="showSpaceDropdown = !showSpaceDropdown"
                class="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                <span class="text-sm font-medium text-gray-700">
                  {{ getSelectedSpaceLabel() }}
                </span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown des espaces -->
              <div *ngIf="showSpaceDropdown" 
                   class="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button 
                  (click)="selectSpace(null)"
                  [class]="getSpaceOptionClass(null)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg">
                  Tous les espaces
                </button>
                <button 
                  *ngFor="let space of availableSpaces"
                  (click)="selectSpace(space.id)"
                  [class]="getSpaceOptionClass(space.id)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 last:rounded-b-lg">
                  {{ space.name }}
                </button>
              </div>
            </div>

            <!-- Sélecteur de vue -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button 
                *ngFor="let view of views"
                (click)="setView(view.key)"
                [class]="getViewButtonClass(view.key)"
                class="px-3 py-1 text-sm font-medium rounded-md transition-colors">
                {{ view.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Légende des statuts -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span class="text-gray-600">En attente</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-gray-600">Confirmé</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="text-gray-600">Rejeté</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span class="text-gray-600">Disponible</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Mois -->
      <div *ngIf="currentView === 'month'" class="bg-white rounded-lg border border-gray-200">
        <!-- En-têtes des jours -->
        <div class="grid grid-cols-7 border-b border-gray-200">
          <div *ngFor="let day of dayHeaders" 
               class="px-4 py-3 text-sm font-medium text-gray-500 text-center">
            {{ day }}
          </div>
        </div>

        <!-- Grille du calendrier -->
        <div class="grid grid-cols-7">
          <div *ngFor="let week of monthData" class="contents">
            <div *ngFor="let day of week.days" 
                 [class]="getDayClass(day)"
                 (click)="selectDate(day.date)"
                 class="min-h-[120px] border-r border-b border-gray-100 p-2 relative cursor-pointer hover:bg-gray-50">
              
              <!-- Numéro du jour -->
              <div class="flex items-center justify-between mb-2">
                <span [class]="getDayNumberClass(day)" class="text-sm font-medium">
                  {{ day.date.getDate() }}
                </span>
              </div>

              <!-- Événements du jour -->
              <div class="space-y-1">
                <div *ngFor="let event of day.events.slice(0, 3); let i = index" 
                     [style.background-color]="event.color"
                     class="text-xs text-white px-2 py-1 rounded text-truncate cursor-pointer"
                     [title]="getEventTooltip(event)">
                  {{ formatEventTime(event) }} {{ event.title }}
                </div>
                
                <!-- Indicateur d'événements supplémentaires -->
                <div *ngIf="day.events.length > 3" 
                     class="text-xs text-gray-500 px-2 py-1">
                  +{{ day.events.length - 3 }} autres
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Semaine -->
      <div *ngIf="currentView === 'week'" class="bg-white rounded-lg border border-gray-200">
        <!-- En-têtes des jours -->
        <div class="grid grid-cols-8 border-b border-gray-200">
          <div class="px-4 py-3"></div> <!-- Colonne des heures -->
          <div *ngFor="let day of weekData" 
               class="px-4 py-3 text-center border-l border-gray-100 cursor-pointer hover:bg-gray-50"
               (click)="selectDate(day.date)"
               [class.bg-purple-50]="day.isSelected">
            <div class="text-sm font-medium text-gray-900">
              {{ formatWeekDayHeader(day.date) }}
            </div>
            <div [class]="getDayNumberClass(day)" class="text-lg font-bold mt-1">
              {{ day.date.getDate() }}
            </div>
          </div>
        </div>

        <!-- Grille horaire -->
        <div class="grid grid-cols-8 max-h-[600px] overflow-y-auto">
          <div *ngFor="let hour of getHours()" class="contents">
            <!-- Colonne des heures -->
            <div class="px-4 py-4 text-sm text-gray-500 border-b border-gray-100 text-right">
              {{ formatHour(hour) }}
            </div>
            
            <!-- Colonnes des jours -->
            <div *ngFor="let day of weekData" 
                 class="border-l border-b border-gray-100 p-2 min-h-[60px] relative">
              
              <!-- Événements pour cette heure -->
              <div *ngFor="let event of getEventsForHour(day, hour)" 
                   [style.background-color]="event.color"
                   class="text-xs text-white px-2 py-1 rounded mb-1 cursor-pointer"
                   [title]="getEventTooltip(event)">
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Jour -->
      <div *ngIf="currentView === 'day'" class="bg-white rounded-lg border border-gray-200">
        <!-- En-tête du jour -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ formatDayHeader(currentDate) }}
          </h3>
        </div>

        <!-- Planning détaillé -->
        <div class="max-h-[600px] overflow-y-auto">
          <div *ngFor="let timeSlot of dayData" 
               class="flex border-b border-gray-100">
            
            <!-- Heure -->
            <div class="w-20 px-4 py-4 text-sm text-gray-500 text-right border-r border-gray-100">
              {{ formatHour(timeSlot.hour) }}
            </div>

            <!-- Contenu du créneau -->
            <div class="flex-1 p-4 min-h-[80px]">
              <div *ngIf="timeSlot.events.length === 0" 
                   class="text-sm text-gray-400 italic">
                Aucune réservation
              </div>

              <div *ngFor="let event of timeSlot.events" 
                   [style.background-color]="event.color + '20'"
                   [style.border-left]="'4px solid ' + event.color"
                   class="p-3 rounded-lg mb-2 cursor-pointer">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                  <span class="text-sm text-gray-600">{{ event.spaceName }}</span>
                </div>
                <div class="text-sm text-gray-600">
                  <div>{{ formatTimeRange(event.start, event.end) }}</div>
                  <div>{{ event.memberName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Réservations pour la date sélectionnée (toutes les vues) -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Réservations pour {{ getSelectedDateFormatted() }}
          </h3>
        </div>
        
        <div class="p-6">
          <div *ngIf="!hasEventsToday()" class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-gray-600">Aucune réservation pour {{ getSelectedDateFormatted() }}</p>
          </div>
          
          <div *ngIf="hasEventsToday()" class="space-y-3">
            <div *ngFor="let event of getTodayEvents()" 
                 class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div [style.background-color]="event.color" 
                   class="w-4 h-4 rounded-full flex-shrink-0"></div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                <p class="text-sm text-gray-600">{{ event.spaceName }}</p>
              </div>
              <div class="text-right text-sm text-gray-600">
                <div>{{ formatTimeRange(event.start, event.end) }}</div>
                <div>{{ event.memberName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendrierComponent implements OnInit {
  currentView: CalendarView = 'month';
  currentDate: Date = new Date();
  selectedSpaceId: string | null = null;
  selectedDate: Date = new Date();
  
  // Données des vues
  monthData: CalendarWeek[] = [];
  weekData: CalendarDay[] = [];
  dayData: TimeSlot[] = [];
  
  // Espaces disponibles
  availableSpaces: Space[] = [];
  showSpaceDropdown = false;

  // Configuration
  dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  views = [
    { key: 'month' as CalendarView, label: 'Mois' },
    { key: 'week' as CalendarView, label: 'Semaine' },
    { key: 'day' as CalendarView, label: 'Jour' }
  ];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.subscribeToCalendar();
    this.loadAvailableSpaces();
    this.loadCalendarData();
  }

  private subscribeToCalendar(): void {
    this.calendarService.currentDate$.subscribe(date => {
      this.currentDate = date;
      this.loadCalendarData();
    });

    this.calendarService.currentView$.subscribe(view => {
      this.currentView = view;
      this.loadCalendarData();
    });

    this.calendarService.selectedSpaceId$.subscribe(spaceId => {
      this.selectedSpaceId = spaceId;
      this.loadCalendarData();
    });

    this.calendarService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
    });
  }

  private loadAvailableSpaces(): void {
    this.availableSpaces = this.calendarService.getAvailableSpaces();
  }

  private loadCalendarData(): void {
    switch (this.currentView) {
      case 'month':
        this.monthData = this.calendarService.getMonthData(this.currentDate);
        break;
      case 'week':
        this.weekData = this.calendarService.getWeekData(this.currentDate);
        break;
      case 'day':
        this.dayData = this.calendarService.getDayData(this.currentDate);
        break;
    }
  }

  // Navigation
  goToPrevious(): void {
    this.calendarService.goToPreviousPeriod();
  }

  goToNext(): void {
    this.calendarService.goToNextPeriod();
  }

  goToToday(): void {
    this.calendarService.goToToday();
  }

  setView(view: CalendarView): void {
    this.calendarService.setCurrentView(view);
  }

  // Sélection de date
  selectDate(date: Date): void {
    this.calendarService.setSelectedDate(date);
  }

  // Gestion des espaces
  selectSpace(spaceId: string | null): void {
    this.calendarService.setSelectedSpaceId(spaceId);
    this.showSpaceDropdown = false;
  }

  getSelectedSpaceLabel(): string {
    if (!this.selectedSpaceId) {
      return 'Tous les espaces';
    }
    const space = this.availableSpaces.find(s => s.id === this.selectedSpaceId);
    return space?.name || 'Espace inconnu';
  }

  getSpaceOptionClass(spaceId: string | null): string {
    return this.selectedSpaceId === spaceId ? 'bg-purple-50 text-purple-700' : 'text-gray-900';
  }

  // Classes CSS
  getViewButtonClass(view: CalendarView): string {
    return this.currentView === view
      ? 'bg-white text-purple-700 shadow-sm'
      : 'text-gray-600 hover:text-gray-900';
  }

  getDayClass(day: CalendarDay): string {
    let classes = 'min-h-[120px] border-r border-b border-gray-100 p-2 relative cursor-pointer hover:bg-gray-50';
    
    if (!day.isCurrentMonth) {
      classes += ' bg-gray-50';
    }
    if (day.isToday) {
      classes += ' bg-purple-50';
    }
    if (day.isSelected) {
      classes += ' bg-purple-100 ring-2 ring-purple-500';
    }
    
    return classes;
  }

  getDayNumberClass(day: CalendarDay): string {
    let classes = 'text-sm font-medium';
    
    if (!day.isCurrentMonth) {
      classes += ' text-gray-400';
    } else if (day.isToday) {
      classes += ' text-purple-700 bg-purple-100 w-6 h-6 rounded-full flex items-center justify-center';
    } else {
      classes += ' text-gray-900';
    }
    
    return classes;
  }

  // Formatage
  getFormattedPeriod(): string {
    switch (this.currentView) {
      case 'month':
        return this.calendarService.formatMonthYear(this.currentDate);
      case 'week':
        return this.calendarService.formatWeekRange(this.currentDate);
      case 'day':
        return this.calendarService.formatDay(this.currentDate);
      default:
        return '';
    }
  }

  formatWeekDayHeader(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  }

  formatDayHeader(date: Date): string {
    return this.calendarService.formatDay(date);
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  formatEventTime(event: CalendarEvent): string {
    return this.calendarService.formatTime(event.start);
  }

  formatTimeRange(start: Date, end: Date): string {
    return this.calendarService.formatTimeRange(start, end);
  }

  // Utilitaires pour les vues
  getHours(): number[] {
    return Array.from({ length: 15 }, (_, i) => i + 8); // 8h à 22h
  }

  getEventsForHour(day: CalendarDay, hour: number): CalendarEvent[] {
    return day.events.filter(event => {
      const eventHour = event.start.getHours();
      return eventHour === hour || (eventHour < hour && event.end.getHours() > hour);
    });
  }

  getEventTooltip(event: CalendarEvent): string {
    return `${event.title}\n${event.spaceName}\n${this.formatTimeRange(event.start, event.end)}\n${event.memberName}`;
  }

  // Événements d'aujourd'hui
  hasEventsToday(): boolean {
    return this.getSelectedDateEvents().length > 0;
  }

  getTodayEvents(): CalendarEvent[] {
    return this.getSelectedDateEvents();
  }

  getSelectedDateEvents(): CalendarEvent[] {
    return this.calendarService.getEventsForDate(this.selectedDate);
  }

  getSelectedDateFormatted(): string {
    if (this.isSameDay(this.selectedDate, new Date())) {
      return "aujourd'hui";
    }
    return this.selectedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}