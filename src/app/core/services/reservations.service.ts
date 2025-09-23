import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  first,
  firstValueFrom,
  map,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { SpacesService, Space } from './spaces.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Response {
  success: boolean;
  message: string;
  data: {};
}

export interface Reservation {
  id: string;
  spaceId: string;
  space?: Space; // Populated from SpacesService
  memberId: string;
  member: Member;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'en-attente' | 'confirmee' | 'rejetee' | 'annulee';
  reason?: string; // Raison du rejet ou de l'annulation
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface ReservationFilter {
  status?: Reservation['status'];
  spaceId?: string;
  memberId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReservationStats {
  total: number;
  enAttente: number;
  confirmees: number;
  rejetees: number;
  annulees: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private readonly STORAGE_KEY = 'cynoia_reservations';
  private readonly MEMBERS_STORAGE_KEY = 'cynoia_members';
  currentUser$ = this.authService.currentUser$;

  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  private membersSubject = new BehaviorSubject<Member[]>([]);

  public reservations$ = this.reservationsSubject.asObservable();
  public members$ = this.membersSubject.asObservable();
  private readonly API_URL =
    environment.apiUrl + 'reservations' ||
    'http://localhost:3000/api/v1/reservations';

  constructor(
    private spacesService: SpacesService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadReservations();
    this.loadMembers();
  }

  getReservations(): Observable<Reservation[]> {
  return this.currentUser$.pipe(
    first(),
    switchMap((currentUser) => {
      const token = sessionStorage.getItem('token'); // ou depuis AuthService si tu préfères
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      return this.http.get<Response>(
        `${this.API_URL}/entity/${currentUser?.entity.id}`,
        { headers }
      );
    }),
    map((response) => {
      const reservations = (response.data as Reservation[]).map((reservation: any) => ({
        ...reservation,
        date: new Date(reservation.date),
        createdAt: new Date(reservation.createdAt),
        updatedAt: new Date(reservation.updatedAt),
      }));

      this.populateSpaceInfo(reservations);
      return reservations;
    }),
    catchError((error) => {
      console.error('Erreur lors du chargement des réservations :', error);
      return throwError(() => error);
    })
  );
}



  private loadReservations(): void {
    const savedReservations = localStorage.getItem(this.STORAGE_KEY);
    if (savedReservations) {
      try {
        const reservations = JSON.parse(savedReservations).map(
          (reservation: any) => ({
            ...reservation,
            date: new Date(reservation.date),
            createdAt: new Date(reservation.createdAt),
            updatedAt: new Date(reservation.updatedAt),
          })
        );
        this.populateSpaceInfo(reservations);
      } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
        this.initializeWithSampleData();
      }
    } else {
      this.initializeWithSampleData();
    }
  }

  private loadMembers(): void {
    const savedMembers = localStorage.getItem(this.MEMBERS_STORAGE_KEY);
    if (savedMembers) {
      try {
        const members = JSON.parse(savedMembers);
        this.membersSubject.next(members);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        this.initializeMembersData();
      }
    } else {
      this.initializeMembersData();
    }
  }

  private initializeMembersData(): void {
    const sampleMembers: Member[] = [
      {
        id: '1',
        name: 'Marie Diallo',
        email: 'marie.diallo@example.com',
        avatar: '',
      },
      {
        id: '2',
        name: 'Ahmed Kouassi',
        email: 'ahmed.kouassi@example.com',
        avatar: '',
      },
      {
        id: '3',
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        avatar: '',
      },
    ];
    this.saveMembers(sampleMembers);
  }

  private initializeWithSampleData(): void {
    const spaces = this.spacesService.getAllSpaces();
    const members = [
      { id: '1', name: 'Marie Diallo', email: 'marie.diallo@example.com' },
      { id: '2', name: 'Ahmed Kouassi', email: 'ahmed.kouassi@example.com' },
    ];

    const sampleReservations: Reservation[] = [
      {
        id: '1',
        spaceId: spaces[0]?.id || '1',
        memberId: '1',
        member: members[0],
        date: new Date('2025-01-15'),
        startTime: '09:00',
        endTime: '12:00',
        status: 'en-attente',
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: 'Réunion importante avec clients',
      },
      {
        id: '2',
        spaceId: spaces[1]?.id || '2',
        memberId: '2',
        member: members[1],
        date: new Date('2025-01-16'),
        startTime: '14:00',
        endTime: '16:00',
        status: 'confirmee',
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: 'Formation équipe',
      },
    ];

    this.populateSpaceInfo(sampleReservations);
  }

  private populateSpaceInfo(reservations: Reservation[]): void {
    const updatedReservations = reservations.map((reservation) => ({
      ...reservation,
      space: this.spacesService.getSpaceById(reservation.spaceId),
    }));
    this.saveReservations(updatedReservations);
  }

  private saveReservations(reservations: Reservation[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reservations));
    this.reservationsSubject.next(reservations);
  }

  private saveMembers(members: Member[]): void {
    localStorage.setItem(this.MEMBERS_STORAGE_KEY, JSON.stringify(members));
    this.membersSubject.next(members);
  }

  // Obtenir toutes les réservations
  getAllReservations(): Reservation[] {
    return this.reservationsSubject.value;
  }

  // Obtenir une réservation par ID
  getReservationById(id: string): Reservation | undefined {
    return this.reservationsSubject.value.find(
      (reservation) => reservation.id === id
    );
  }

  // Filtrer les réservations
  getFilteredReservations(filter: ReservationFilter): Reservation[] {
    let reservations = this.reservationsSubject.value;

    if (filter.status) {
      reservations = reservations.filter((r) => r.status === filter.status);
    }

    if (filter.spaceId) {
      reservations = reservations.filter((r) => r.spaceId === filter.spaceId);
    }

    if (filter.memberId) {
      reservations = reservations.filter((r) => r.memberId === filter.memberId);
    }

    if (filter.dateFrom) {
      reservations = reservations.filter((r) => r.date >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      reservations = reservations.filter((r) => r.date <= filter.dateTo!);
    }

    return reservations;
  }

  // Obtenir les réservations par statut
  getReservationsByStatus(status: Reservation['status']): Reservation[] {
    return this.getFilteredReservations({ status });
  }

  // Ajouter une nouvelle réservation
  addReservation(
    reservationData: Omit<
      Reservation,
      'id' | 'createdAt' | 'updatedAt' | 'space'
    >
  ): Reservation {
    const newReservation: Reservation = {
      ...reservationData,
      id: this.generateId(),
      space: this.spacesService.getSpaceById(reservationData.spaceId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentReservations = this.reservationsSubject.value;
    const updatedReservations = [...currentReservations, newReservation];
    this.saveReservations(updatedReservations);

    return newReservation;
  }

  // Mettre à jour le statut d'une réservation
  updateReservationStatus(
    id: string,
    status: Reservation['status'],
    reason?: string
  ): Reservation | null {
    const currentReservations = this.reservationsSubject.value;
    const reservationIndex = currentReservations.findIndex((r) => r.id === id);

    if (reservationIndex === -1) {
      return null;
    }

    const updatedReservation: Reservation = {
      ...currentReservations[reservationIndex],
      status,
      reason,
      updatedAt: new Date(),
    };

    const updatedReservations = [...currentReservations];
    updatedReservations[reservationIndex] = updatedReservation;
    this.saveReservations(updatedReservations);

    return updatedReservation;
  }

  // Accepter une réservation
  acceptReservation(id: string): Reservation | null {
    return this.updateReservationStatus(id, 'confirmee');
  }

  // Rejeter une réservation
  rejectReservation(id: string, reason?: string): Reservation | null {
    return this.updateReservationStatus(id, 'rejetee', reason);
  }

  // Annuler une réservation
  cancelReservation(id: string, reason?: string): Reservation | null {
    return this.updateReservationStatus(id, 'annulee', reason);
  }

  // Supprimer une réservation
  deleteReservation(id: string): boolean {
    const currentReservations = this.reservationsSubject.value;
    const filteredReservations = currentReservations.filter((r) => r.id !== id);

    if (filteredReservations.length === currentReservations.length) {
      return false; // Réservation non trouvée
    }

    this.saveReservations(filteredReservations);
    return true;
  }

  // Obtenir les statistiques
  getReservationStats(): ReservationStats {
    const reservations = this.reservationsSubject.value;
    return {
      total: reservations.length,
      enAttente: reservations.filter((r) => r.status === 'en-attente').length,
      confirmees: reservations.filter((r) => r.status === 'confirmee').length,
      rejetees: reservations.filter((r) => r.status === 'rejetee').length,
      annulees: reservations.filter((r) => r.status === 'annulee').length,
    };
  }

  // Obtenir tous les membres
  getAllMembers(): Member[] {
    return this.membersSubject.value;
  }

  // Obtenir un membre par ID
  getMemberById(id: string): Member | undefined {
    return this.membersSubject.value.find((member) => member.id === id);
  }

  // Générer les initiales d'un membre
  getMemberInitials(member: Member): string {
    return member.name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Formater la date pour l'affichage
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  // Formater l'heure pour l'affichage
  formatTime(startTime: string, endTime: string): string {
    return `${startTime}-${endTime}`;
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Méthode pour vider toutes les réservations (utile pour les tests)
  clearAllReservations(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.reservationsSubject.next([]);
  }

  // Méthode pour rafraîchir les informations des espaces dans les réservations
  refreshSpaceInfo(): void {
    const currentReservations = this.reservationsSubject.value;
    this.populateSpaceInfo(currentReservations);
  }
}
