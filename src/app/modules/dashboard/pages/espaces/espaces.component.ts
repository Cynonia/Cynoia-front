import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpacesService, Space, SpaceFilter } from '../../../../core/services/spaces.service';

@Component({
  selector: 'app-espaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des espaces</h1>
          </div>
          <p class="text-gray-600">Gérez vos bureaux, salles et équipements</p>
        </div>
        <button 
          (click)="openAddSpaceModal()"
          class="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Ajouter un espace
        </button>
      </div>

      <!-- Filtres -->
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          <span class="text-gray-700 font-medium">Filtrer par type :</span>
        </div>
        <div class="flex gap-2">
          <button 
            *ngFor="let filter of filterOptions"
            (click)="setActiveFilter(filter.value)"
            [class]="getFilterButtonClass(filter.value)"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="filteredSpaces.length === 0 && !isLoading" class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ currentFilter === 'tous' ? 'Aucun espace créé' : 'Aucun ' + getFilterLabel(currentFilter) + ' trouvé' }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ currentFilter === 'tous' 
              ? 'Commencez par créer votre premier espace pour gérer vos bureaux, salles et équipements.' 
              : 'Aucun espace de ce type n\'est disponible pour le moment.' }}
          </p>
          <button 
            (click)="openAddSpaceModal()"
            class="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Créer mon premier espace
          </button>
        </div>
      </div>

      <!-- Grille des espaces -->
      <div *ngIf="filteredSpaces.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let space of filteredSpaces" class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
          <!-- Image de l'espace -->
          <div class="h-48 bg-gray-200 relative overflow-hidden">
            <img *ngIf="space.image" [src]="space.image" [alt]="space.name" class="w-full h-full object-cover">
            <div *ngIf="!space.image" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            
            <!-- Actions flottantes -->
            <div class="absolute top-3 right-3 flex gap-2">
              <button 
                (click)="editSpace(space)"
                class="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button 
                (click)="deleteSpace(space)"
                class="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenu de la carte -->
          <div class="p-4">
            <!-- Badge de type -->
            <div class="flex items-center justify-between mb-3">
              <span [class]="getTypeBadgeClass(space.type)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getTypeLabel(space.type) }}
              </span>
              <span [class]="getStatusBadgeClass(space.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getStatusLabel(space.status) }}
              </span>
            </div>

            <!-- Nom et description -->
            <h3 class="font-semibold text-gray-900 mb-2">{{ space.name }}</h3>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ space.description }}</p>

            <!-- Détails -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {{ space.capacity }} personne{{ space.capacity > 1 ? 's' : '' }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ space.availability }}
              </div>
            </div>

            <!-- Prix -->
            <div class="flex items-center justify-between">
              <div class="text-lg font-bold text-green-600">
                {{ space.price | number }} FCFA/jour
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'ajout/édition -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ editingSpace ? "Modifier l'espace" : "Ajouter un nouvel espace" }}
            </h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveSpace()" class="p-6 space-y-4">
            <!-- Nom de l'espace -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'espace <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="spaceForm.name" 
                name="name"
                placeholder="Bureau 101"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>

            <!-- Type d'espace -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type d'espace <span class="text-red-500">*</span>
              </label>
              <select 
                [(ngModel)]="spaceForm.type" 
                name="type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <option value="bureau">Bureau</option>
                <option value="salle">Salle</option>
                <option value="equipement">Équipement</option>
              </select>
            </div>

            <!-- Capacité et Prix -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
                <input 
                  type="number" 
                  [(ngModel)]="spaceForm.capacity" 
                  name="capacity"
                  min="1"
                  placeholder="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prix (FCFA/jour)</label>
                <input 
                  type="number" 
                  [(ngModel)]="spaceForm.price" 
                  name="price"
                  min="0"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
            </div>

            <!-- Disponibilité -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
              <input 
                type="text" 
                [(ngModel)]="spaceForm.availability" 
                name="availability"
                placeholder="8h-18h"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                [(ngModel)]="spaceForm.description" 
                name="description"
                rows="3"
                placeholder="Description de l'espace..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
            </div>

            <!-- Upload d'image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Image de l'espace</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                <input 
                  type="file" 
                  (change)="onImageSelect($event)" 
                  accept="image/*"
                  class="hidden" 
                  #fileInput>
                <div *ngIf="!spaceForm.image" (click)="fileInput.click()" class="cursor-pointer">
                  <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <p class="text-sm text-gray-600">Cliquez pour ajouter une image</p>
                </div>
                <div *ngIf="spaceForm.image" class="relative">
                  <img [src]="spaceForm.image" alt="Preview" class="max-h-32 mx-auto rounded">
                  <button 
                    type="button"
                    (click)="removeImage()"
                    class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex gap-3 pt-4">
              <button 
                type="button" 
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button 
                type="submit"
                [disabled]="!isFormValid()"
                class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {{ editingSpace ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EspacesComponent implements OnInit {
  spaces: Space[] = [];
  filteredSpaces: Space[] = [];
  isLoading = false;
  showAddModal = false;
  editingSpace: Space | null = null;
  currentFilter: SpaceFilter['type'] = 'tous';

  filterOptions = [
    { value: 'tous' as const, label: 'Tous' },
    { value: 'bureau' as const, label: 'Bureaux' },
    { value: 'salle' as const, label: 'Salles' },
    { value: 'equipement' as const, label: 'Équipements' }
  ];

  spaceForm = {
    name: '',
    type: 'bureau' as Space['type'],
    description: '',
    capacity: 1,
    price: 0,
    availability: '8h-18h',
    status: 'disponible' as Space['status'],
    image: ''
  };

  constructor(private spacesService: SpacesService) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.isLoading = true;
    this.spacesService.spaces$.subscribe(spaces => {
      this.spaces = spaces;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters(): void {
    const filter: SpaceFilter = {
      type: this.currentFilter
    };
    this.filteredSpaces = this.spacesService.getFilteredSpaces(filter);
  }

  setActiveFilter(filterType: SpaceFilter['type']): void {
    this.currentFilter = filterType;
    this.applyFilters();
  }

  getFilterButtonClass(filterType: SpaceFilter['type']): string {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    if (filterType === this.currentFilter) {
      return `${baseClass} bg-purple-600 text-white`;
    }
    return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }

  getFilterLabel(filterType: SpaceFilter['type']): string {
    const option = this.filterOptions.find(opt => opt.value === filterType);
    return option ? option.label.toLowerCase() : filterType;
  }

  getTypeBadgeClass(type: Space['type']): string {
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

  getTypeLabel(type: Space['type']): string {
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

  getStatusBadgeClass(status: Space['status']): string {
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

  getStatusLabel(status: Space['status']): string {
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

  openAddSpaceModal(): void {
    this.editingSpace = null;
    this.resetForm();
    this.showAddModal = true;
  }

  editSpace(space: Space): void {
    this.editingSpace = space;
    this.spaceForm = {
      name: space.name,
      type: space.type,
      description: space.description,
      capacity: space.capacity,
      price: space.price,
      availability: space.availability,
      status: space.status,
      image: space.image || ''
    };
    this.showAddModal = true;
  }

  deleteSpace(space: Space): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${space.name}" ?`)) {
      this.spacesService.deleteSpace(space.id);
    }
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editingSpace = null;
    this.resetForm();
  }

  resetForm(): void {
    this.spaceForm = {
      name: '',
      type: 'bureau',
      description: '',
      capacity: 1,
      price: 0,
      availability: '8h-18h',
      status: 'disponible',
      image: ''
    };
  }

  isFormValid(): boolean {
    return this.spaceForm.name.trim().length > 0 && 
           this.spaceForm.capacity > 0 && 
           this.spaceForm.price >= 0;
  }

  saveSpace(): void {
    if (!this.isFormValid()) {
      return;
    }

    const spaceData = {
      name: this.spaceForm.name.trim(),
      type: this.spaceForm.type,
      description: this.spaceForm.description.trim(),
      capacity: this.spaceForm.capacity,
      price: this.spaceForm.price,
      availability: this.spaceForm.availability.trim() || '8h-18h',
      status: this.spaceForm.status,
      image: this.spaceForm.image,
      features: []
    };

    if (this.editingSpace) {
      this.spacesService.updateSpace(this.editingSpace.id, spaceData);
    } else {
      this.spacesService.addSpace(spaceData);
    }

    this.closeModal();
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide.');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.spaceForm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.spaceForm.image = '';
  }
}