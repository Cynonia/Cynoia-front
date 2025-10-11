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
import { EspaceService } from './espace.service';
import { ApiService, ApiResponse } from './api.service';
import { AuthService } from './auth.service';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Reservation {
  id: string;
  reservationDate: Date|string;
  startTime: string;
  endTime: string;
  // Canonical status used across the app. Use normalizeReservationStatus() to map legacy values.
  status: 'en-attente' | 'confirmee' | 'rejetee' | 'en-cours';
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  espace?: {
    id: string;
    name: string;
    images: string[];
    location: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
  // Local compatibility fields used in the app
  spaceId?: string;
  memberId?: string;
  member?: Member;
  // Resolved space reference
  space?: Space | undefined;
}

export interface ReservationFilter {
  status?: Reservation['status'];
  spaceId?: string;
  memberId?: string;
  dateFrom?: Date|string;
  dateTo?: Date|string;
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
  currentUser$ = this.authService.currentUser$;

  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  private membersSubject = new BehaviorSubject<Member[]>([]);

  public reservations$ = this.reservationsSubject.asObservable();
  public members$ = this.membersSubject.asObservable();
  private readonly endpoint = '/reservations';

  /**
   * Normalize various legacy/backend status values into the canonical set used by the UI.
   * Returns one of: 'rejetee' | 'confirmee' | 'en-attente' | 'en-cours'
   */
  static normalizeReservationStatus(raw?: string|null): Reservation['status'] {
    const s = (raw || '').toString().trim().toLowerCase();
    if (!s) return 'en-attente';

    if (s.includes('rej') || s.includes('refus') || s === 'annulee' || s === 'cancelled' || s === 'cancel') {
      return 'rejetee';
    }

    if (s.includes('confirm') || s === 'confirmee' || s === 'confirmed' || s === 'validate' || s === 'validated') {
      return 'confirmee';
    }

    if (s.includes('cours') || s === 'en-cours' || s === 'in_progress' || s === 'ongoing') {
      return 'en-cours';
    }

    if (s.includes('attente') || s === 'pending' || s === 'waiting') {
      return 'en-attente';
    }

    // default fallback
    return 'en-attente';
  }

  constructor(
    private spacesService: SpacesService,
    private api: ApiService,
    private authService: AuthService,
    private espaceService: EspaceService
  ) {
    // Populate initial state from API
    this.refreshFromApi();
  }

  /**
   * Refresh reservations and members from the API and populate local subjects.
   */
  refreshFromApi(): void {
    this.getReservations().pipe(first()).subscribe({
      next: (reservations) => {
        // populateSpaceInfo already calls next on the reservations subject
        console.debug('[ReservationsService] fetched', reservations.length, 'reservations from API');
        this.reservationsSubject.next(reservations);
        // Derive members from reservations if none provided by API
        const members: Member[] = reservations
          .map(r => r.member)
          .filter((m): m is Member => !!m);
        if (members.length > 0) this.membersSubject.next(members);
      },
      error: (err) => {
        console.error('Unable to refresh reservations from API:', err);
        this.reservationsSubject.next([]);
      }
    });
  }

  getReservations(): Observable<Reservation[]> {
    return this.currentUser$.pipe(
      first(),
      switchMap((currentUser) => {
        if (!currentUser || !currentUser.entity?.id) {
          // No authenticated user yet - return empty list
          return new Observable<ApiResponse<Reservation[]>>(subscriber => {
            subscriber.next({ data: [], success: true });
            subscriber.complete();
          });
        }
        return this.api.get<Reservation[]>(`${this.endpoint}/entity/${currentUser.entity.id}`);
      }),
      map((response: ApiResponse<Reservation[]>) => {
        const reservations = (response.data || []).map((reservation: any) => ({
          ...reservation,
          reservationDate: new Date(reservation.reservationDate || reservation.date),
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

  acceptReservationApi(id: string): Observable<Reservation> {
    return this.currentUser$.pipe(
      first(),
      switchMap((currentUser) => {
        if (!currentUser || (currentUser.role.toLowerCase() !== 'admin' && currentUser.role.toLowerCase() !== 'manager')) {
          return throwError(() => new Error('Unauthorized'));
        }
        return this.api.post<Reservation>(`${this.endpoint}/${id}/validate`, {});
      }),
      map((response: ApiResponse<Reservation>) => {
        const data = response.data as any;
        const reservation: Reservation = {
          ...data,
          reservationDate: new Date(data.reservationDate),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };

        const currentReservations = this.reservationsSubject.value;
        const reservationIndex = currentReservations.findIndex((r) => r.id === id);
        if (reservationIndex !== -1) {
          currentReservations[reservationIndex] = reservation;
          this.saveReservations([...currentReservations]);
        }

        return reservation;
      }),
      catchError((error) => {
        console.error("Erreur lors de l'acceptation de la réservation :", error);
        return throwError(() => error);
      })
    );
  }

  rejectReservationApi(id: string, reason?: string): Observable<Reservation> {
    return this.currentUser$.pipe(
      first(),
      switchMap((currentUser) => {
        if (!currentUser || (currentUser.role.toLowerCase() !== 'admin' && currentUser.role.toLowerCase() !== 'manager')) {
          return throwError(() => new Error('Unauthorized'));
        }
        return this.api.post<Reservation>(`${this.endpoint}/${id}/refuse`, { reason });
      }),
      map((response: ApiResponse<Reservation>) => {
        const data = response.data as any;
        const reservation: Reservation = {
          ...data,
          reservationDate: new Date(data.reservationDate),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };

        const currentReservations = this.reservationsSubject.value;
        const reservationIndex = currentReservations.findIndex((r) => r.id === id);
        if (reservationIndex !== -1) {
          currentReservations[reservationIndex] = reservation;
          this.saveReservations([...currentReservations]);
        }

        return reservation;
      }),
      catchError((error) => {
        console.error('Erreur lors du rejet de la réservation :', error);
        return throwError(() => error);
      })
    );
  }
    

  createReservation(
    reservationData: any
  ): Observable<Reservation> {
    return this.currentUser$.pipe(
      first(),
      switchMap(() => this.api.post<Reservation>(this.endpoint, reservationData)),
      map((response: ApiResponse<Reservation>) => {
        const data = response.data as any;
        const reservation: Reservation = {
          ...data,
          reservationDate: new Date(data.reservationDate),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };

  // Append to local subject so UI updates immediately
  const currentReservations = this.reservationsSubject.value;
  const updatedReservations = [...currentReservations, reservation];
  this.reservationsSubject.next(updatedReservations);

        return reservation;
      }),
      catchError((error) => {
        console.error('Erreur lors de la création de la réservation :', error);
        return throwError(() => error);
      })
    );
  }


  private populateSpaceInfo(reservations: Reservation[]): void {
    // First, try to resolve from local cache (SpacesService) or embedded reservation.espace
    const updatedReservations = reservations.map((reservation) => {
      const rawId = reservation.spaceId ?? reservation.espace?.id ?? '' as any;
      const spaceId = rawId !== null && rawId !== undefined ? String(rawId) : '';
      const localSpace = this.spacesService.getSpaceById(spaceId);
      return {
        ...reservation,
        space: localSpace,
      };
    });
    this.reservationsSubject.next(updatedReservations);

    // Then, for any reservations still missing space details, fetch from backend using getEspaceById
    const missingIds = Array.from(new Set(
      updatedReservations
        .filter(r => !r.space)
        .map(r => (r.spaceId ?? r.espace?.id))
        .map(id => id !== null && id !== undefined ? Number(id as any) : NaN)
        .filter(n => !Number.isNaN(n))
    ));

    if (missingIds.length === 0) return;

    missingIds.forEach(numericId => {
      if (isNaN(numericId)) return;
      this.espaceService.getById(numericId).pipe(first()).subscribe({
        next: (resp) => {
          const e = resp?.data as any;
          if (!e) return;
          const enriched: Space = this.mapEspaceToSpace(e);
          const current = this.reservationsSubject.value;
          const patched = current.map(r => {
            const rId = (r.spaceId ?? r.espace?.id ?? '') as any;
            const rIdStr = rId !== null && rId !== undefined ? String(rId) : '';
            return rIdStr === String(numericId) ? { ...r, space: enriched } : r;
          });
          this.reservationsSubject.next(patched);
        },
        error: () => {
          // Ignore individual fetch errors; leave reservation.space undefined
        }
      });
    });
  }

  private mapEspaceToSpace(espace: any): Space {
    return {
      id: String(espace.id),
      name: espace.name,
      type: this.mapTypeIdToType(espace.typeEspacesId),
      description: espace.description || '',
      capacity: espace.capacity ?? 0,
      price: espace.pricePerHour ?? 0,
      availability: '8h-18h',
      status: espace.status === false ? false : true,
      image: Array.isArray(espace.images) && espace.images.length > 0 ? espace.images[0] : undefined,
      features: [],
      createdAt: new Date(espace.createdAt || Date.now()),
      updatedAt: new Date(espace.updatedAt || Date.now()),
    };
  }

  private mapTypeIdToType(typeId: number): 'bureau' | 'salle' | 'equipement' {
    switch (typeId) {
      case 2: return 'bureau';
      case 3: return 'equipement';
      case 1:
      default: return 'salle';
    }
  }

  private saveReservations(reservations: Reservation[]): void {
    // Persisting locally removed; keep in-memory subject for UI updates
    this.reservationsSubject.next(reservations);
  }

  private saveMembers(members: Member[]): void {
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
      reservations = reservations.filter((r) => ReservationsService.normalizeReservationStatus(r.status) === filter.status);
    }

    if (filter.spaceId) {
      reservations = reservations.filter((r) => r.spaceId === filter.spaceId);
    }

    if (filter.memberId) {
      reservations = reservations.filter((r) => r.memberId === filter.memberId);
    }

    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom);
      reservations = reservations.filter((r) => new Date(r.reservationDate) >= from);
    }

    if (filter.dateTo) {
      const to = new Date(filter.dateTo);
      reservations = reservations.filter((r) => new Date(r.reservationDate) <= to);
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
    throw new Error('Local addReservation is deprecated. Use createReservation() to persist via API.');
  }

  // Mettre à jour le statut d'une réservation
  updateReservationStatus(
    id: string,
    status: Reservation['status'],
    reason?: string
  ): Reservation | null {
    throw new Error('Local updateReservationStatus is deprecated. Use acceptReservationApi/rejectReservationApi or API endpoints.');
  }

  // Accepter une réservation
  acceptReservation(id: string): Reservation | null {
    throw new Error('Local acceptReservation is deprecated. Use acceptReservationApi() instead.');
  }

  // Rejeter une réservation
  rejectReservation(id: string, reason?: string): Reservation | null {
    throw new Error('Local rejectReservation is deprecated. Use rejectReservationApi() instead.');
  }

  // Annuler une réservation
  cancelReservation(id: string, reason?: string): Reservation | null {
    throw new Error('Local cancelReservation is deprecated. Use API endpoint to cancel reservations.');
  }

  // Supprimer une réservation
  deleteReservation(id: string): boolean {
    throw new Error('Local deleteReservation is deprecated. Use API endpoint to delete reservations.');
  }

  // Obtenir les statistiques
  getReservationStats(): ReservationStats {
    const reservations = this.reservationsSubject.value;

    console.log(reservations);
    
    return {
      total: reservations.length,
      enAttente: reservations.filter((r) => r.status === 'en-cours').length,
      confirmees: reservations.filter((r) => r.status === 'confirmee').length,
      rejetees: reservations.filter((r) => r.status === 'rejetee').length,
      annulees: reservations.filter((r) => {
        const s = (r as any).status?.toString().toLowerCase();
        return s === 'annulee' || s === 'cancelled' || s === 'cancel' || s === 'annule';
      }).length,
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
    // ID generation is deprecated; IDs should come from the backend
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Méthode pour vider toutes les réservations (utile pour les tests)
  clearAllReservations(): void {
    // Clear in-memory reservations only
    this.reservationsSubject.next([]);
  }

  // Méthode pour rafraîchir les informations des espaces dans les réservations
  refreshSpaceInfo(): void {
    const currentReservations = this.reservationsSubject.value;
    this.populateSpaceInfo(currentReservations);
  }
}
