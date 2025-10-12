// espaces.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
// Removed unused SpacesService import
import { EspaceService } from '../../../../core/services/espace.service';
import { EspaceFormComponent } from './espace-modal.component';
import { ModalService } from '../../../../core/services/modal.service';

// Interface pour les données de l'API
interface ApiEspace {
  id: number;
  name: string;
  surface: number;
  description: string;
  capacity: number;
  status: boolean;
  validation: boolean;
  pricePerHour: number;
  images: string[];
  location: string | null;
  entitiesId: number;
  typeEspacesId: number;
  entity: {
    id: number;
    name: string;
    logo: string;
    couleur: string;
    avatar: string;
    domaine: string;
  };
  type: {
    id: number;
    name: string;
    code: string;
    status: boolean;
  };
  reservations: any[];
  equipements: any[];
}

// Interface pour les données transformées pour l'UI
interface UiSpace {
  id: number;
  name: string;
  description: string;
  capacity: number;
  status: 'disponible' | 'occupe' | 'maintenance';
  price: number;
  availability: string;
  type: 'bureau' | 'salle' | 'equipement';
  image?: string;
  entity?: string;
  location?: string;
  surface?: number;
}

@Component({
  selector: 'app-espaces',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EspaceFormComponent],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 sm:gap-3 mb-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0" type="button">
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              Gestion des espaces
            </h1>
          </div>
          <p class="text-xs sm:text-sm text-gray-600 truncate">Gérez vos bureaux, salles et équipements</p>
        </div>
        <button
          (click)="openAddSpaceModal()"
          class="w-full sm:w-auto flex items-center justify-center gap-2 btn-primary px-3 sm:px-4 py-2 rounded-lg hover:brightness-90 transition-colors text-sm whitespace-nowrap flex-shrink-0"
          type="button"
        >
          <svg
            class="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Ajouter un espace
        </button>
      </div>

      <!-- Filtres -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div class="flex items-center gap-2 flex-shrink-0">
          <svg
            class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span class="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">Filtrer par type :</span>
        </div>
        <div class="flex gap-2 flex-wrap w-full sm:w-auto">
          <button
            *ngFor="let filter of filterOptions"
            (click)="setActiveFilter(filter.value)"
            [ngClass]="getFilterButtonClass(filter.value)"
            class="text-xs sm:text-sm"
            type="button"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Chargement -->
      <div *ngIf="isLoading" class="text-center py-16">
        <div
          class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Chargement...
        </div>
      </div>

      <!-- État vide -->
      <div
        *ngIf="filteredSpaces.length === 0 && !isLoading"
        class="text-center py-16"
      >
        <div class="max-w-md mx-auto">
          <div
            class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{
              currentFilter === 'tous'
                ? 'Aucun espace créé'
                : 'Aucun ' + getFilterLabel(currentFilter) + ' trouvé'
            }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{
              currentFilter === 'tous'
                ? 'Commencez par créer votre premier espace pour gérer vos bureaux, salles et équipements.'
                : 'Aucun espace de ce type n est disponible pour le moment.'
            }}
          </p>
          <button
            (click)="openAddSpaceModal()"
            class="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg hover:brightness-90 transition-colors"
            type="button"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Créer mon premier espace
          </button>
        </div>
      </div>

      <!-- Grille des espaces -->
      <div
        *ngIf="filteredSpaces.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
      >
        <div
          *ngFor="let space of filteredSpaces"
          class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
        >
          <div class="h-28 sm:h-32 bg-gray-200 relative overflow-hidden flex-shrink-0">
            <img
              *ngIf="space.image"
              [src]="space.image"
              [alt]="space.name"
              class="w-full h-full object-cover"
            />
            <div
              *ngIf="!space.image"
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
            >
              <svg
                class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div class="absolute top-2 right-2 flex gap-1.5">
              <button
                (click)="editSpace(space)"
                class="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                type="button"
              >
                <svg
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                (click)="deleteSpace(space)"
                class="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                type="button"
              >
                <svg
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-2.5 sm:p-3 flex flex-col flex-1">
            <div class="flex items-center justify-between mb-2 gap-2">
              <span
                [ngClass]="getTypeBadgeClass(space.type)"
                class="px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0"
              >
                {{ getTypeLabel(space.type) }}
              </span>
              <span
                [ngClass]="getStatusBadgeClass(space.status)"
                class="px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0"
              >
                {{ getStatusLabel(space.status) }}
              </span>
            </div>

            <h3 class="text-sm sm:text-base font-semibold text-gray-900 mb-1 truncate">{{ space.name }}</h3>
            <p class="text-xs text-gray-600 mb-2 line-clamp-2 flex-1">
              {{ space.description }}
            </p>

            <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2 mb-2 sm:mb-3">
              <div class="flex items-center text-[10px] sm:text-xs text-gray-600">
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span class="truncate">{{ space.capacity }} pers.</span>
              </div>

              <div
                *ngIf="space.surface"
                class="flex items-center text-[10px] sm:text-xs text-gray-600"
              >
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span class="truncate">{{ space.surface }} m²</span>
              </div>

              <div
                *ngIf="space.location"
                class="flex items-center text-[10px] sm:text-xs text-gray-600 col-span-2"
              >
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="truncate">{{ space.location }}</span>
              </div>

              <div class="flex items-center text-[10px] sm:text-xs text-gray-600 col-span-2">
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ space.availability }}
              </div>

              <div
                *ngIf="space.entity"
                class="flex items-center text-xs text-gray-600"
              >
                <svg
                  class="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {{ space.entity }}
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-base font-bold text-green-600">
                {{ space.price | number }} FCFA/heure
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'ajout / édition -->
      <div
        *ngIf="showAddModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <app-espace-modal
          [editingSpace]="editingSpace"
          (modalClosed)="closeModal()"
          (spaceCreated)="onSpaceCreated($event)"
          (spaceUpdated)="onSpaceUpdated($event)"
        />
      </div>
    </div>
  `,
})
export class EspacesComponent implements OnInit {
  spaces: UiSpace[] = [];
  filteredSpaces: UiSpace[] = [];
  isLoading = false;
  showAddModal = false;
  editingSpace: UiSpace | null = null;
  currentFilter: 'tous' | 'bureau' | 'salle' | 'equipement' = 'tous';

  spaceForm!: FormGroup;

  filterOptions = [
    { value: 'tous' as const, label: 'Tous' },
    { value: 'bureau' as const, label: 'Bureaux' },
    { value: 'salle' as const, label: 'Salles' },
    { value: 'equipement' as const, label: 'Équipements' },
  ];

  constructor(private espaceService: EspaceService, private fb: FormBuilder, private modal: ModalService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSpaces();
  }

  initForm(): void {
    this.spaceForm = this.fb.group({
      name: ['', Validators.required],
      typeEspacesId: [1, Validators.required],
      description: [''],
      capacity: [1, [Validators.required, Validators.min(1)]],
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      surface: [0, [Validators.min(0)]],
      location: [''],
      status: [true],
      validation: [true],
      images: [[]],
    });
  }

  loadSpaces(): void {
    this.isLoading = true;
    this.espaceService.getAll().subscribe({
      next: (response: any) => {
        console.log('Response from API:', response);

        if (response.success && response.data) {
          // Transformer les données de l'API vers le format attendu par l'UI
          this.spaces = this.transformApiDataToUiData(response.data);
          this.applyFilters();
        } else {
          console.error('Invalid response format:', response);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading spaces:', error);
        this.isLoading = false;
      },
    });
  }

  private transformApiDataToUiData(apiData: ApiEspace[]): UiSpace[] {
    return apiData.map((space) => ({
      id: space.id,
      name: space.name,
      description: space.description,
      capacity: space.capacity,
      status: space.status ? 'disponible' : 'maintenance', // Adapter selon la logique métier
      price: space.pricePerHour,
      availability: '8h-18h', // Valeur par défaut, à adapter selon vos besoins
      type: this.mapTypeIdToType(space.typeEspacesId),
      image:
        space.images && space.images.length > 0 ? space.images[0] : undefined,
      entity: space.entity?.name,
      location: space.location || undefined,
      surface: space.surface,
    }));
  }

  private mapTypeIdToType(typeId: number): 'bureau' | 'salle' | 'equipement' {
    // Adapter selon vos types d'espaces
    switch (typeId) {
      case 1:
        return 'salle'; // "Salle de reunion"
      case 2:
        return 'bureau';
      case 3:
        return 'equipement';
      default:
        return 'salle';
    }
  }

  applyFilters(): void {
    if (this.currentFilter === 'tous') {
      this.filteredSpaces = [...this.spaces];
    } else {
      this.filteredSpaces = this.spaces.filter(
        (space) => space.type === this.currentFilter
      );
    }
  }

  setActiveFilter(
    filterType: 'tous' | 'bureau' | 'salle' | 'equipement'
  ): void {
    this.currentFilter = filterType;
    this.applyFilters();
  }

  openAddSpaceModal(): void {
    this.editingSpace = null;
    this.initForm();
    this.showAddModal = true;
  }

  editSpace(space: UiSpace): void {
    this.editingSpace = space;
    this.spaceForm.setValue({
      name: space.name,
      typeEspacesId: this.getTypeIdFromType(space.type),
      description: space.description,
      capacity: space.capacity,
      pricePerHour: space.price,
      surface: space.surface || 0,
      location: space.location || '',
      status: space.status === 'disponible',
      validation: true,
      images: space.image ? [space.image] : [],
    });
    this.showAddModal = true;
  }

  async deleteSpace(space: UiSpace): Promise<void> {
    const ok = await this.modal.confirm({
      title: 'Supprimer l\'espace',
      message: `Êtes-vous sûr de vouloir supprimer l'espace "${space.name}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });
    if (!ok) return;
    this.espaceService.delete(space.id).subscribe({
      next: () => {
        this.spaces = this.spaces.filter(s => s.id !== space.id);
        this.applyFilters(); 
      },
      error: (error) => {
        console.error('Error deleting space', error);
      },
    });
  }


  private getTypeIdFromType(type: 'bureau' | 'salle' | 'equipement'): number {
    switch (type) {
      case 'salle':
        return 1;
      case 'bureau':
        return 2;
      case 'equipement':
        return 3;
      default:
        return 1;
    }
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingSpace = null;
    this.spaceForm.reset();
  }

  onSpaceCreated(newSpace: any): void {
    // Recharger les espaces après création
    this.loadSpaces();
  }

  onSpaceUpdated(updatedSpace: any): void {
    // Recharger les espaces après mise à jour
    this.loadSpaces();
  }

  getFilterButtonClass(
    filterType: 'tous' | 'bureau' | 'salle' | 'equipement'
  ): string {
    const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    if (filterType === this.currentFilter) {
  return `${base} btn-primary text-white`;
    }
    return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }

  getFilterLabel(
    filterType: 'tous' | 'bureau' | 'salle' | 'equipement'
  ): string {
    const opt = this.filterOptions.find((o) => o.value === filterType);
    return opt ? opt.label.toLowerCase() : filterType;
  }

  getTypeBadgeClass(type: 'bureau' | 'salle' | 'equipement'): string {
    switch (type) {
      case 'bureau':
        return 'bg-blue-100 text-blue-800';
      case 'salle':
        return 'bg-green-100 text-green-800';
      case 'equipement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeLabel(type: 'bureau' | 'salle' | 'equipement'): string {
    switch (type) {
      case 'bureau':
        return 'Bureau';
      case 'salle':
        return 'Salle';
      case 'equipement':
        return 'Équipement';
      default:
        return type;
    }
  }

  getStatusBadgeClass(status: 'disponible' | 'occupe' | 'maintenance'): string {
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

  getStatusLabel(status: 'disponible' | 'occupe' | 'maintenance'): string {
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
