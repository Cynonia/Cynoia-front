import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReservationsService, Reservation } from './reservations.service';
import { SpacesService, Space } from './spaces.service';

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  spaceId: string;
  spaceName: string;
  status: 'en-attente' | 'confirmee' | 'rejetee' | 'en-cours';
  memberName: string;
  color: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface TimeSlot {
  hour: number;
  events: CalendarEvent[];
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private currentDateSubject = new BehaviorSubject<Date>(new Date());
  private currentViewSubject = new BehaviorSubject<CalendarView>('month');
  private selectedSpaceIdSubject = new BehaviorSubject<string | null>(null);
  private selectedDateSubject = new BehaviorSubject<Date>(new Date());

  public currentDate$ = this.currentDateSubject.asObservable();
  public currentView$ = this.currentViewSubject.asObservable();
  public selectedSpaceId$ = this.selectedSpaceIdSubject.asObservable();
  public selectedDate$ = this.selectedDateSubject.asObservable();

  constructor(
    private reservationsService: ReservationsService,
    private spacesService: SpacesService
  ) {}

  // Navigation
  getCurrentDate(): Date {
    return this.currentDateSubject.value;
  }

  setCurrentDate(date: Date): void {
    this.currentDateSubject.next(date);
  }

  getCurrentView(): CalendarView {
    return this.currentViewSubject.value;
  }

  setCurrentView(view: CalendarView): void {
    this.currentViewSubject.next(view);
  }

  getSelectedSpaceId(): string | null {
    return this.selectedSpaceIdSubject.value;
  }

  setSelectedSpaceId(spaceId: string | null): void {
    this.selectedSpaceIdSubject.next(spaceId);
  }

  getSelectedDate(): Date {
    return this.selectedDateSubject.value;
  }

  setSelectedDate(date: Date): void {
    this.selectedDateSubject.next(date);
  }

  // Navigation par période
  goToPreviousPeriod(): void {
    const currentDate = this.getCurrentDate();
    const view = this.getCurrentView();
    let newDate: Date;

    switch (view) {
      case 'month':
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        break;
      case 'week':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        break;
    }

    this.setCurrentDate(newDate);
  }

  goToNextPeriod(): void {
    const currentDate = this.getCurrentDate();
    const view = this.getCurrentView();
    let newDate: Date;

    switch (view) {
      case 'month':
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        break;
      case 'week':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'day':
        newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        break;
    }

    this.setCurrentDate(newDate);
  }

  goToToday(): void {
    this.setCurrentDate(new Date());
  }

  // Conversion des réservations en événements calendrier
  private convertReservationToEvent(reservation: Reservation): CalendarEvent {
  // Normalize space id to string to avoid mismatches between number/string
  const rawSpaceId = (reservation as any).spaceId ?? reservation.espace?.id ?? '';
  const spaceId = rawSpaceId !== null && rawSpaceId !== undefined ? String(rawSpaceId) : '';
  const space = reservation.espace || this.spacesService.getSpaceById(spaceId);
    
    // Conversion des heures string en Date
    const reservationDate = reservation.reservationDate ? new Date(reservation.reservationDate) : new Date();
  let startDate = new Date(reservationDate);
  let endDate = new Date(reservationDate);
    
    // Parse des heures (format "HH:MM") - be defensive in case fields are missing
    let startHour = 8, startMinute = 0;
    let endHour: number | null = null, endMinute: number | null = null;
    try {
      if (reservation.startTime) {
        const s = (reservation.startTime || '').toString().split(':').map(Number);
        if (!isNaN(s[0])) startHour = s[0];
        if (!isNaN(s[1])) startMinute = s[1];
      }
      if (reservation.endTime) {
        const e = (reservation.endTime || '').toString().split(':').map(Number);
        if (!isNaN(e[0])) endHour = e[0];
        if (!isNaN(e[1])) endMinute = e[1];
      }
    } catch (err) {
      // keep defaults
    }

    startDate.setHours(startHour, startMinute, 0, 0);

    // If end time is provided and parseable, use it; otherwise derive from duration or default to +1h
    if (endHour !== null) {
      endDate.setHours(endHour, endMinute ?? 0, 0, 0);
      // If end is not after start, try to derive from duration or add 1 hour
      if (endDate <= startDate) {
        if (typeof (reservation as any).duration === 'number' && (reservation as any).duration > 0) {
          endDate = new Date(startDate.getTime() + (reservation as any).duration * 60 * 60 * 1000);
        } else {
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }
      }
    } else {
      // No end time provided: use duration if available, otherwise default +1h
      if (typeof (reservation as any).duration === 'number' && (reservation as any).duration > 0) {
        endDate = new Date(startDate.getTime() + (reservation as any).duration * 60 * 60 * 1000);
      } else {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
    }

    // Prefer the reservation creator (user) when available, fallback to member or generic label
    const memberName = reservation.user?.firstName || reservation.user?.lastName
      ? `${reservation.user?.firstName || ''} ${reservation.user?.lastName || ''}`.trim()
      : reservation.member?.name || (reservation as any).memberName || 'Membre inconnu';

    const normalizedStatus = ReservationsService.normalizeReservationStatus((reservation as any).status);
    return {
      id: reservation.id,
      title: `Réservation`,
      start: startDate,
      end: endDate,
      spaceId: spaceId,
      spaceName: space?.name || 'Espace inconnu',
      status: normalizedStatus,
      memberName,
      color: this.getEventColor(normalizedStatus)
    };
  }

  private getEventColor(status: string): string {
    switch (status) {
      case 'confirmee':
        return '#10B981'; // Vert
      case 'rejetee':
        return '#EF4444'; // Rouge
      case 'en-attente':
        return '#F59E0B'; // Jaune/Orange
      case 'en-cours':
        return '#3B82F6'; // Bleu
      default:
        return '#6B7280'; // Gris
    }
  }

  // Données pour la vue mois
  getMonthData(date: Date = this.getCurrentDate()): CalendarWeek[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Premier lundi de la première semaine (ou le premier jour si c'est un lundi)
    const startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    // Dernier dimanche de la dernière semaine
    const endDate = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(lastDay.getDate() + daysToAdd);

    // Récupérer les réservations pour la période
  const reservations = this.getReservationsForPeriod(startDate, endDate) || [];
  const events = reservations.map(r => this.convertReservationToEvent(r));

  console.debug('[CalendarService] month events generated:', events.length, 'for', startDate.toISOString(), '->', endDate.toISOString());

    // Générer les semaines
    const weeks: CalendarWeek[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= endDate) {
      const week: CalendarDay[] = [];
      
      for (let i = 0; i < 7; i++) {
        const dayEvents = events.filter(event => 
          this.isSameDay(event.start, currentDate)
        );

        const calendarDay: CalendarDay = {
          date: new Date(currentDate),
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: this.isSameDay(currentDate, today),
          isSelected: this.isSameDay(currentDate, this.getSelectedDate()),
          events: dayEvents
        };

        week.push(calendarDay);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push({ days: week });
    }

    return weeks;
  }

  // Données pour la vue semaine
  getWeekData(date: Date = this.getCurrentDate()): CalendarDay[] {
    const startOfWeek = this.getStartOfWeek(date);
    const days: CalendarDay[] = [];
    const today = new Date();

    // Récupérer les réservations pour la semaine
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  const reservations = this.getReservationsForPeriod(startOfWeek, endOfWeek) || [];
  const events = reservations.map(r => this.convertReservationToEvent(r));

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      const dayEvents = events.filter(event => 
        this.isSameDay(event.start, currentDate)
      );

      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: this.isSameDay(currentDate, today),
        isSelected: this.isSameDay(currentDate, this.getSelectedDate()),
        events: dayEvents
      });
    }

    return days;
  }

  // Données pour la vue jour
  getDayData(date: Date = this.getCurrentDate()): TimeSlot[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Récupérer les réservations pour le jour
  const reservations = this.getReservationsForPeriod(startOfDay, endOfDay) || [];
  const events = reservations.map(r => this.convertReservationToEvent(r));

    // Créer les créneaux horaires (8h à 22h)
    const timeSlots: TimeSlot[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      const slotEvents = events.filter(event => {
        const eventHour = event.start.getHours();
        return eventHour === hour || (eventHour < hour && event.end.getHours() > hour);
      });

      timeSlots.push({
        hour,
        events: slotEvents
      });
    }

    return timeSlots;
  }

  // Récupération des réservations
  private getReservationsForPeriod(startDate: Date, endDate: Date): Reservation[] {
    const allReservations = (this.reservationsService && this.reservationsService.getAllReservations)
      ? this.reservationsService.getAllReservations() : [];
    const selectedSpaceId = this.getSelectedSpaceId();

    return allReservations.filter(reservation => {
      // Filtrer par période - comparer les dates
      const reservationDate = reservation.reservationDate ? new Date(reservation.reservationDate) : null;
      const isInPeriod = reservationDate ? (reservationDate >= startDate && reservationDate <= endDate) : false;

      // Filtrer par espace si sélectionné
      const isInSelectedSpace = !selectedSpaceId || (reservation.spaceId ?? reservation.espace?.id) === selectedSpaceId;

      return isInPeriod && isInSelectedSpace;
    });
  }

  // Utilitaires
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  // Formatage des dates
  formatMonthYear(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  formatWeekRange(date: Date): string {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startFormatted = startOfWeek.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    const endFormatted = endOfWeek.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });

    return `${startFormatted} - ${endFormatted}`;
  }

  formatDay(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatTimeRange(start: Date, end: Date): string {
    return `${this.formatTime(start)} - ${this.formatTime(end)}`;
  }

  // Gestion des espaces
  getAvailableSpaces(): Space[] {
    return this.spacesService.getAllSpaces();
  }

  getSelectedSpace(): Space | null {
    const spaceId = this.getSelectedSpaceId();
    return spaceId ? this.spacesService.getSpaceById(spaceId) || null : null;
  }

  // Récupération des événements pour une date spécifique
  getEventsForDate(date: Date): CalendarEvent[] {
    const dayData = this.getDayData(date);
    const events: CalendarEvent[] = [];
    
    dayData.forEach(slot => {
      events.push(...slot.events);
    });
    
    return events;
  }
}