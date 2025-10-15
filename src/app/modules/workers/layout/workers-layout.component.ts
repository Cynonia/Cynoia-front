import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services';
import { Observable } from 'rxjs';
import { ReservationsService, Reservation } from '../../../core/services/reservations.service';

@Component({
  selector: 'app-workers-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workers-layout.component.html'
})
export class WorkersLayoutComponent implements OnInit {
  pageTitle = 'Dashboard';
  reservationsCount = 0;
  reservationsActives = 0;
  reservationsEnAttente = 0;
  showMobileSidebar = false;

  currentUser$: Observable<any | null>;

  constructor(private authService: AuthService, private reservationsService: ReservationsService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Trigger a refresh from API and subscribe to live reservations to compute counters
    this.reservationsService.refreshFromApi();
    this.reservationsService.reservations$.subscribe((reservations) => {
      this.updateCounters(reservations);
    });
  }

  private updateCounters(reservations: Reservation[]): void {
    const normalize = ReservationsService.normalizeReservationStatus;
    this.reservationsCount = reservations.length;
    this.reservationsActives = reservations.filter(r => {
      const s = normalize((r as any).status);
      return s === 'confirmee' || s === 'en-cours';
    }).length;
    this.reservationsEnAttente = reservations.filter(r => normalize((r as any).status) === 'en-attente').length;
  }

  toggleMobileSidebar(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  closeMobileMenu(): void {
    this.showMobileSidebar = false;
  }

  logout(): void {
    this.authService.signOut();
    console.log("deconn");
    
  }
}
