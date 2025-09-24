import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpacesService, Space } from '../../../../core/services/spaces.service';

@Component({
  selector: 'app-espaces-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Espaces disponibles</h1>
        <p class="text-gray-600 mt-2">Trouvez l'espace parfait pour votre travail</p>
      </div>

      <!-- Barre de recherche -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <input 
          type="text" 
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Rechercher un espace...">
      </div>

      <!-- Filtres -->
      <div class="flex flex-wrap gap-4">
        <!-- Filtre par région -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">Toutes régions</label>
          <select 
            [(ngModel)]="selectedRegion"
            (change)="onFilterChange()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option value="">Toutes régions</option>
            <option value="abidjan">Abidjan</option>
            <option value="bouake">Bouaké</option>
            <option value="yamoussoukro">Yamoussoukro</option>
          </select>
        </div>

        <!-- Filtre par type -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">Tous types</label>
          <select 
            [(ngModel)]="selectedType"
            (change)="onFilterChange()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option value="">Tous types</option>
            <option value="bureau">Bureau</option>
            <option value="salle">Salle de réunion</option>
            <option value="equipement">Équipement</option>
          </select>
        </div>

        <!-- Filtre par prix -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">Tous prix</label>
          <select 
            [(ngModel)]="selectedPriceRange"
            (change)="onFilterChange()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <option value="">Tous prix</option>
            <option value="0-10000">0 - 10 000 FCFA</option>
            <option value="10000-25000">10 000 - 25 000 FCFA</option>
            <option value="25000+">25 000+ FCFA</option>
          </select>
        </div>
      </div>

      <!-- Résultats -->
      <div>
        <p class="text-gray-600 mb-6">{{ filteredSpaces.length }} espace{{ filteredSpaces.length > 1 ? 's' : '' }} trouvé{{ filteredSpaces.length > 1 ? 's' : '' }}</p>

        <!-- Grille des espaces -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let space of filteredSpaces" 
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            (click)="goToSpaceDetail(space.id)">
            
            <!-- Image de l'espace -->
            <div class="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                *ngIf="space.image" 
                [src]="space.image" 
                [alt]="space.name" 
                class="w-full h-full object-cover">
              <div 
                *ngIf="!space.image" 
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>

              <!-- Note et badge -->
              <div class="absolute top-3 right-3 flex items-center gap-2">
                <div class="bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">{{ getSpaceRating(space) }}</span>
                </div>
              </div>

              <!-- Localisation -->
              <div class="absolute bottom-3 left-3">
                <div class="bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="text-sm text-gray-700">{{ getSpaceLocation(space) }}</span>
                </div>
              </div>
            </div>

            <!-- Contenu de la carte -->
            <div class="p-4">
              <!-- En-tête avec nom et hub -->
              <div class="mb-2">
                <h3 class="font-semibold text-lg text-gray-900">{{ space.name }}</h3>
                <p class="text-sm text-gray-600">Cynoia Hub {{ getSpaceLocation(space) }}</p>
              </div>

              <!-- Détails -->
              <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>{{ space.capacity }} pers.</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ space.availability }}</span>
                </div>
              </div>

              <!-- Équipements -->
              <div class="flex items-center gap-2 mb-4">
                <div *ngIf="hasWifi(space)" class="flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                  </svg>
                  <span>Wifi</span>
                </div>
                <div *ngIf="hasAC(space)" class="flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 20v-2m8-10h2m-2 4h2m-6-4h.01M17 16h.01"/>
                  </svg>
                  <span>Climatisation</span>
                </div>
                <div *ngIf="hasParking(space)" class="flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                  </svg>
                  <span>Parking</span>
                </div>
              </div>

              <!-- Prix et statut -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span 
                    [class]="getStatusBadgeClass(space.status)"
                    class="px-3 py-1 text-xs font-medium rounded-full">
                    {{ getStatusLabel(space.status) }}
                  </span>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-purple-600">{{ space.price | number }} FCFA</div>
                  <div class="text-xs text-gray-500">par jour</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div *ngIf="filteredSpaces.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucun espace trouvé</h3>
          <p class="text-gray-600">Essayez d'ajuster vos filtres de recherche</p>
        </div>
      </div>
    </div>
  `
})
export class EspacesDisponiblesComponent implements OnInit {
  spaces: Space[] = [];
  filteredSpaces: Space[] = [];
  searchTerm = '';
  selectedRegion = '';
  selectedType = '';
  selectedPriceRange = '';

  constructor(
    private spacesService: SpacesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    this.spaces = this.spacesService.getAllSpaces().filter(space => space.status === 'disponible');
    this.filteredSpaces = [...this.spaces];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.spaces];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(space => 
        space.name.toLowerCase().includes(searchLower) ||
        space.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par région (basé sur le nom de l'espace pour l'instant)
    if (this.selectedRegion) {
      filtered = filtered.filter(space => 
        space.name.toLowerCase().includes(this.selectedRegion.toLowerCase())
      );
    }

    // Filtre par type
    if (this.selectedType) {
      filtered = filtered.filter(space => space.type === this.selectedType);
    }

    // Filtre par prix
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(p => p.replace('+', ''));
      filtered = filtered.filter(space => {
        if (max) {
          return space.price >= parseInt(min) && space.price <= parseInt(max);
        } else {
          return space.price >= parseInt(min);
        }
      });
    }

    this.filteredSpaces = filtered;
  }

  goToSpaceDetail(spaceId: string): void {
    this.router.navigate(['/workers/detail-espace', spaceId]);
  }

  getSpaceRating(space: Space): string {
    // Génère une note aléatoire entre 4.0 et 4.8
    return (4.0 + Math.random() * 0.8).toFixed(1);
  }

  getSpaceLocation(space: Space): string {
    // Extrait la localisation du nom ou utilise une valeur par défaut
    if (space.name.toLowerCase().includes('abidjan')) return 'Abidjan';
    if (space.name.toLowerCase().includes('cocody')) return 'Cocody';
    if (space.name.toLowerCase().includes('plateau')) return 'Plateau';
    if (space.name.toLowerCase().includes('marcory')) return 'Marcory';
    return 'Abidjan';
  }

  hasWifi(space: Space): boolean {
    return space.features?.includes('Wifi') || space.features?.includes('wifi') || true;
  }

  hasAC(space: Space): boolean {
    return space.features?.includes('Climatisation') || space.features?.includes('AC') || true;
  }

  hasParking(space: Space): boolean {
    return space.features?.includes('Parking') || space.features?.includes('parking') || false;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'occupe':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'disponible':
        return 'Disponible';
      case 'occupe':
        return 'Occupé';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  }
}