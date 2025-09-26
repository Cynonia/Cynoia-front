import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EspaceService } from '../../../../core/services/espace.service';

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

      <!-- Loader -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-10">
        <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span class="ml-3 text-purple-600 font-medium">Chargement des espaces...</span>
      </div>

      <!-- Résultats -->
      <div *ngIf="!isLoading">
        <p class="text-gray-600 mb-6">{{ filteredSpaces.length }} espace{{ filteredSpaces.length > 1 ? 's' : '' }} trouvé{{ filteredSpaces.length > 1 ? 's' : '' }}</p>

        <!-- Grille des espaces -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let space of filteredSpaces" 
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            (click)="goToSpaceDetail(space.id)">
            
            <!-- Image -->
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                </svg>
              </div>

              <!-- Badge note -->
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

            <!-- Contenu -->
            <div class="p-4">
              <div class="mb-2">
                <h3 class="font-semibold text-lg text-gray-900">{{ space.name }}</h3>
                <p class="text-sm text-gray-600">Cynoia Hub {{ getSpaceLocation(space) }}</p>
              </div>

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

              <div class="flex items-center justify-between">
                <span [class]="getStatusBadgeClass(space.status)" class="px-3 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(space.status) }}
                </span>
                <div class="text-right">
                  <div class="text-lg font-bold text-purple-600">{{ space.price | number }} FCFA</div>
                  <div class="text-xs text-gray-500">par jour</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aucun résultat -->
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
  spaces: UiSpace[] = [];
  filteredSpaces: UiSpace[] = [];
  isLoading = false;
  searchTerm = '';
  selectedRegion = '';
  selectedType = '';
  selectedPriceRange = '';

  constructor(private espaceService: EspaceService, private router: Router) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    this.isLoading = true;
    this.espaceService.getAll().subscribe({
      next: (response: any) => {
        const apiData = response.success && response.data ? response.data : response;
        this.spaces = this.transformApiDataToUiData(apiData).filter(space => space.status === 'disponible');
        this.filteredSpaces = [...this.spaces];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading espaces:', error);
        this.isLoading = false;
      }
    });
  }

  private transformApiDataToUiData(apiData: any[]): UiSpace[] {
    return apiData.map((space: any) => ({
      id: space.id,
      name: space.name,
      description: space.description,
      capacity: space.capacity,
      status: space.status ? 'disponible' : 'maintenance',
      price: space.pricePerHour,
      availability: '8h-18h',
      type: this.mapTypeIdToType(space.typeEspacesId),
      image: space.images && space.images.length > 0 ? space.images[0] : undefined,
      entity: space.entity?.name,
      location: space.location || undefined,
      surface: space.surface,
    }));
  }

  private mapTypeIdToType(typeId: number): 'bureau' | 'salle' | 'equipement' {
    switch (typeId) {
      case 1: return 'salle';
      case 2: return 'bureau';
      case 3: return 'equipement';
      default: return 'salle';
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.spaces];

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(space => 
        space.name.toLowerCase().includes(searchLower) ||
        (space.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    if (this.selectedRegion) {
      filtered = filtered.filter(space => 
        (space.location ?? '').toLowerCase().includes(this.selectedRegion.toLowerCase())
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter(space => space.type === this.selectedType);
    }

    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.includes('+') 
        ? [25000, Infinity] 
        : this.selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(space => space.price >= min && space.price <= max);
    }

    this.filteredSpaces = filtered;
  }

  goToSpaceDetail(id: number): void {
    this.router.navigate(['/workers/detail-espace', id]);
  }

  getSpaceRating(space: UiSpace): number {
    return parseFloat((4.0 + Math.random() * 0.8).toFixed(1)); // ou autre logique
  }

  getSpaceLocation(space: UiSpace): string {
    return space.location ?? 'Non spécifié';
  }

  getStatusBadgeClass(status: string): string {
    return status === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }

  getStatusLabel(status: string): string {
    return status === 'disponible' ? 'Disponible' : 'En maintenance';
  }

  hasWifi(space: UiSpace): boolean {
    return true;
  }

  hasAC(space: UiSpace): boolean {
    return true;
  }

  hasParking(space: UiSpace): boolean {
    return true;
  }
}

interface UiSpace {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  status: string;
  price: number;
  availability: string;
  type: 'bureau' | 'salle' | 'equipement';
  image?: string;
  entity?: string;
  location?: string;
  surface?: number;
}
