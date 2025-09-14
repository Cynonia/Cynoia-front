import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrandingService, BrandingConfig } from '../../../core/services/branding.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <!-- Logo et nom de l'espace -->
        <div class="flex items-center gap-3 px-6 py-4 border-b">
          <div class="w-8 h-8 rounded flex items-center justify-center" 
               [style.background-color]="branding.primaryColor">
            <span class="text-white text-sm font-bold">{{ spaceInitials }}</span>
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">{{ spaceName }}</h2>
            <p class="text-xs text-gray-500">{{ spaceDescription }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-6">
          <div class="px-3">
            <a routerLink="/dashboard" 
               routerLinkActive="border-r-2"
               [routerLinkActiveOptions]="{exact: true}"
               [style.border-color]="branding.primaryColor"
               [style.color]="branding.primaryColor"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1 router-link-active:bg-purple-50"
               [class.bg-purple-50]="true"
               [class.text-purple-700]="true">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              Dashboard
            </a>

            <a routerLink="/dashboard/espaces" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 0v12h8V4H6z"/>
              </svg>
              Espaces
            </a>

            <a routerLink="/dashboard/reservations" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1 relative">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
              </svg>
              Réservations
              <span class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ pendingReservations }}
              </span>
            </a>

            <a routerLink="/dashboard/calendrier" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
              </svg>
              Calendrier
            </a>

            <a routerLink="/dashboard/membres" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              Membres
            </a>

            <a routerLink="/dashboard/finances" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"/>
              </svg>
              Finances
            </a>

            <a routerLink="/dashboard/messages" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              Messages
            </a>

            <a routerLink="/dashboard/parametres" 
               routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-700"
               class="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 mb-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"/>
              </svg>
              Paramètres
            </a>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="ml-64">
        <!-- Top Header -->
        <header class="bg-white shadow-sm border-b px-6 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
              <p class="text-gray-600 text-sm">{{ pageDescription }}</p>
            </div>
            
            <!-- User Menu -->
            <div class="flex items-center gap-4">
              <button class="p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
                </svg>
              </button>
              
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
                <button (click)="toggleUserMenu()" class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">{{ userInitials }}</span>
                  </div>
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                  </svg>
                </button>
              </div>

              <!-- User Dropdown -->
              <div *ngIf="showUserMenu" class="absolute right-6 top-16 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
                <hr class="my-1">
                <button (click)="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent implements OnInit {
  userName: string = '';
  userInitials: string = '';
  spaceName: string = '';
  spaceDescription: string = '';
  spaceInitials: string = '';
  pageTitle: string = 'Dashboard';
  pageDescription: string = 'Vue d\'ensemble de votre espace de coworking';
  pendingReservations: number = 1;
  showUserMenu: boolean = false;
  branding: BrandingConfig;

  constructor(
    private authService: AuthService,
    private brandingService: BrandingService
  ) {
    this.branding = this.brandingService.getCurrentBranding();
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser;
    this.userName = currentUser?.name || 'Utilisateur';
    this.userInitials = this.getInitials(this.userName);

    // Initialiser les informations de l'organisation depuis le service de branding
    const organization = this.brandingService.currentOrganization;
    if (organization) {
      this.spaceName = organization.name;
      this.spaceDescription = organization.description;
      this.spaceInitials = this.branding.initials;
    }
  }

  private getInitials(name: string): string {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.signOut();
  }
}