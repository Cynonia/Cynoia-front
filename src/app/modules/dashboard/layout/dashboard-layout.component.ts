import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandingService, Organization } from '../../../core/services/branding.service';
import { ReservationsService, Reservation } from '../../../core/services/reservations.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Mobile menu button -->
      <button (click)="toggleMobileSidebar()" 
              class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900">
        <svg *ngIf="!showMobileSidebar" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg *ngIf="showMobileSidebar" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Mobile overlay -->
      <div *ngIf="showMobileSidebar" 
           (click)="toggleMobileSidebar()"
           class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40"
           [class.translate-x-0]="showMobileSidebar"
           [class.-translate-x-full]="!showMobileSidebar"
           [class.lg:translate-x-0]="true">
        <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b">
          <ng-container *ngIf="branding?.logo; else noLogo">
            <img [src]="branding?.logo" [alt]="branding?.name" class="w-28 sm:w-32 h-10 sm:h-12 object-contain" />
          </ng-container>
          <ng-template #noLogo>
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 [style.backgroundColor]="branding?.primaryColor || '#6B46C1'">
              <span class="text-white text-base font-bold">{{ spaceInitials }}</span>
            </div>
          </ng-template>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-base text-gray-900 truncate">{{ spaceName }}</h2>
            <p class="text-xs text-gray-500 truncate">{{ spaceDescription }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-6 px-3 space-y-1">
          <a routerLink="/dashboard"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <span class="truncate">Dashboard</span>
          </a>

          <a routerLink="/dashboard/espaces"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/espaces') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 0v12h8V4H6z"/>
            </svg>
            <span class="truncate">Espaces</span>
          </a>

          <a routerLink="/dashboard/reservations"
             (click)="closeMobileMenu()"
             class="nav-link relative text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/reservations') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
            </svg>
            <span class="truncate">Réservations</span>
            <span *ngIf="pendingReservationsCount > 0"
                  class="ml-auto flex-shrink-0 bg-red-500 text-white text-xs font-semibold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
              {{ pendingReservationsCount > 99 ? '99+' : pendingReservationsCount }}
            </span>
          </a>

          <a routerLink="/dashboard/calendrier"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/calendrier') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="truncate">Calendrier</span>
          </a>

          <a routerLink="/dashboard/membres"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/membres') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 15a4 4 0 018 0v1H4v-1zM14 15h2a2 2 0 012 2v1H12v-1a2 2 0 012-2z"/>
            </svg>
            <span class="truncate">Membres</span>
          </a>

          <a routerLink="/dashboard/finances"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/finances') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3"/>
              <path d="M12 14v4m0-12v2m-7 4h14"/>
            </svg>
            <span class="truncate">Finances</span>
          </a>

          <a routerLink="/dashboard/messages"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/messages') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 11.5a8.38 8.38 0 01-2.14 5.65"/>
              <path d="M3 21v-6a9 9 0 0118 0v6"/>
              <path d="M7 10h10M7 14h7"/>
            </svg>
            <span class="truncate">Messages</span>
          </a>

          <a routerLink="/dashboard/parametres"
             (click)="closeMobileMenu()"
             class="nav-link text-sm sm:text-base"
             [ngStyle]="isActive('/dashboard/parametres') ? getActiveStyle() : {}">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11 4a1 1 0 10-2 0v1H7a1 1 0 000 2h2v1H7a1 1 0 000 2h2v1H7a1 1 0 000 2h2v1a1 1 0 102 0v-1h2a1 1 0 100-2h-2v-1h2a1 1 0 100-2h-2V7h2a1 1 0 100-2h-2V4z" clip-rule="evenodd"/>
            </svg>
            <span class="truncate">Paramètres</span>
          </a>
        </nav>
      </div>

      <!-- Main Content -->
  <div class="lg:ml-64 flex flex-col min-h-screen">
        <!-- Top Header -->
        <header class="bg-white shadow-sm border-b px-4 sm:px-6 py-4 flex-shrink-0">
          <div class="flex justify-between items-center">
            <div class="flex-1 min-w-0 ml-12 lg:ml-0">
              <h1 class="text-lg sm:text-2xl font-semibold text-gray-900 truncate">{{ pageTitle }}</h1>
              <p class="text-gray-600 text-xs sm:text-sm hidden sm:block">{{ pageDescription }}</p>
            </div>

            <div class="flex items-center gap-2 sm:gap-4 relative">
            <button class="p-2 text-gray-400 hover:text-gray-600 hidden sm:block" aria-label="Notifications">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
              </svg>
            </button>

            <div class="flex items-center gap-2 sm:gap-3 cursor-pointer" (click)="toggleUserMenu()">
              <span class="text-xs sm:text-sm font-medium text-gray-700 hidden md:block">{{ userName }}</span>
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                {{ userInitials }}
              </div>
              <svg class="w-4 h-4 text-gray-400 hidden sm:block" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>

            <div *ngIf="showUserMenu"
                 class="absolute right-0 top-12 sm:mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
              <hr class="my-1">
              <button (click)="logout()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Déconnexion</button>
            </div>
          </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-4 sm:p-6 flex-1">
          <div class="w-full h-full">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      color: #4B5563;
      border-radius: 0.5rem;
      margin-bottom: 0.25rem;
      transition: all 0.2s ease;
      border-right: 2px solid transparent;
      text-decoration: none;
      cursor: pointer;
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  userName = '';
  userInitials = '';
  spaceName = '';
  spaceDescription = '';
  spaceInitials = '';
  pageTitle = 'Dashboard';
  pageDescription = 'Vue d\'ensemble de votre espace de coworking';
  showUserMenu = false;
  showMobileSidebar = false;
  branding: Organization | null = null;
  primaryColor = '#6B46C1'; // Couleur par défaut si pas définie
  pendingReservationsCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private brandingService: BrandingService,
    private reservationsService: ReservationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.branding = this.brandingService.currentOrganization;
    if (this.branding?.primaryColor) {
      this.primaryColor = this.branding.primaryColor;
    }

    const currentUser = this.authService.currentUser;
    this.userName = currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : 'Utilisateur';
    this.userInitials = this.getInitials(this.userName);

    if (this.branding) {
      this.spaceName = this.branding.name;
      this.spaceDescription = this.branding.description;
      this.spaceInitials = this.getInitials(this.branding.name);
    }

    // Initialize pending reservations count from current cache
    const initial = this.reservationsService.getAllReservations?.() ?? [];
    this.pendingReservationsCount = (initial || []).filter((r: any) => {
      const s = ReservationsService.normalizeReservationStatus(r.status);
      return s === 'en-attente' || s === 'en-cours';
    }).length;

    // Subscribe to updates
    this.reservationsService.reservations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((reservations: Reservation[]) => {
        this.pendingReservationsCount = (reservations || []).filter((r: any) => {
          const s = ReservationsService.normalizeReservationStatus(r.status);
          return s === 'en-attente' || s === 'en-cours';
        }).length;
      });

    // Trigger fetch if none loaded yet
    if (!initial || initial.length === 0) {
      this.reservationsService.getReservations().subscribe({
        next: () => {},
        error: () => {},
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileSidebar(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  closeMobileMenu(): void {
    this.showMobileSidebar = false;
  }

  logout(): void {
    this.authService.signOut();
  }

  isActive(path: string): boolean {
    // Pour faire match partiel on peut utiliser startsWith ou includes
    return this.router.url === path;
  }

  getActiveStyle(): { [key: string]: string } {
    return {
      color: this.primaryColor,
      backgroundColor: this.hexWithOpacity(this.primaryColor, 0.1),
      borderRight: `2px solid ${this.primaryColor}`,
      fontWeight: '600'
    };
  }

  private hexWithOpacity(hex: string, opacity: number): string {
    const cleanedHex = hex.replace('#', '');
    const bigint = parseInt(cleanedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
