import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EspaceService } from '../../../../core/services/espace.service';
import { CommonModule} from '@angular/common';
import { AuthService } from '../../../../core/services';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-espace-modal',
  template: `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ editingSpace ? 'Modifier l espace' : 'Nouvel espace' }}
        </h2>
        <button
          (click)="closeModal()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <form [formGroup]="spaceForm" (ngSubmit)="saveSpace()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nom -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'espace *
              </label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Salle de réunion A1"
              />
              <div *ngIf="spaceForm.get('name')?.invalid && spaceForm.get('name')?.touched" 
                   class="text-red-500 text-sm mt-1">
                Le nom est requis
              </div>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type d'espace *
              </label>
              <select
                formControlName="typeEspacesId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sélectionner un type</option>
                <option value="1">Salle de réunion</option>
                <option value="2">Bureau</option>
                <option value="3">Équipement</option>
              </select>
              <div *ngIf="spaceForm.get('typeEspacesId')?.invalid && spaceForm.get('typeEspacesId')?.touched" 
                   class="text-red-500 text-sm mt-1">
                Le type est requis
              </div>
            </div>

            <!-- Capacité -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Capacité
              </label>
              <input
                type="number"
                formControlName="capacity"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 10"
              />
            </div>

            <!-- Surface -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Surface (m²)
              </label>
              <input
                type="number"
                formControlName="surface"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 25"
              />
            </div>

            <!-- Prix par heure -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Prix par heure (FCFA)
              </label>
              <input
                type="number"
                formControlName="pricePerHour"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 5000"
              />
            </div>

            <!-- Localisation -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Localisation
              </label>
              <input
                type="text"
                formControlName="location"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 1er étage, aile gauche"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Description de l'espace..."
              ></textarea>
            </div>

            <!-- Status -->
            <div >
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="status"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span class="ml-2 text-sm text-gray-700">Espace actif</span>
              </label>
            </div>

            <!-- Validation -->
            <div >
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="validation"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span class="ml-2 text-sm text-gray-700">Validation requise</span>
              </label>
            </div>

            <!-- Images -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              
              <!-- Upload -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  (change)="onImageSelect($event)"
                  accept="image/*"
                  multiple
                  class="hidden"
                  #fileInput
                />
                <button
                  type="button"
                  (click)="fileInput.click()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter des images
                </button>
                <p class="text-sm text-gray-500 mt-2">
                  Formats acceptés: JPG, PNG, GIF
                </p>
              </div>

              <!-- Preview -->
              <div *ngIf="imagePreviews.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div *ngFor="let image of imagePreviews; let i = index" class="relative">
                  <img
                    [src]="image"
                    [alt]="'Preview ' + (i + 1)"
                    class="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    (click)="removeImage(i)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-2 border-t bg-gray-50">
        <button
          type="button"
          (click)="closeModal()"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          (click)="saveSpace()"
          [disabled]="spaceForm.invalid || isLoading"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span *ngIf="!isLoading">
            {{ editingSpace ? 'Mettre à jour' : 'Créer l espace' }}
          </span>
          <span *ngIf="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Traitement...
          </span>
        </button>
      </div>
    </div>
  `,
  imports: [ReactiveFormsModule, CommonModule],
})
export class EspaceFormComponent implements OnInit {
  @Input() editingSpace: any = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() spaceCreated = new EventEmitter<any>();
  @Output() spaceUpdated = new EventEmitter<any>();
  currentUser$ = this.authService.currentUser$;


  espaceService = inject(EspaceService);
  spaceForm!: FormGroup;
  imagePreviews: string[] = [];
  isLoading = false;

  constructor(private fb: FormBuilder,private authService: AuthService) {}

  ngOnInit(): void {
    this.initForm();

    console.log(this.editingSpace);
    

    if (this.editingSpace) {
      this.spaceForm.patchValue(this.editingSpace);
      if (this.editingSpace.images) {
        this.imagePreviews = [...this.editingSpace.images];
        this.spaceForm.get('images')?.setValue(this.imagePreviews);
      }
    }
  }

  async initForm(): Promise<void> {
    const currentUser = await firstValueFrom(this.currentUser$)
  this.spaceForm = this.fb.group({
    name: [this.editingSpace?.name ?? '', Validators.required],
    surface: [this.editingSpace?.surface ?? null],
    description: [this.editingSpace?.description ?? ''],
    capacity: [this.editingSpace?.capacity ?? null, Validators.min(0)],
    status: [this.editingSpace?.status ?? true],
    validation: [this.editingSpace?.validation ?? false],
    pricePerHour: [this.editingSpace?.pricePerHour ?? null, Validators.min(0)],
    location: [this.editingSpace?.location ?? ''],
    entitiesId: [currentUser?.entity.id],
    typeEspacesId: [this.editingSpace?.typeEspacesId ?? '', Validators.required],
    images: [this.editingSpace?.images ?? []],
  });
}


  saveSpace(): void {
    if (this.spaceForm.invalid) {
      this.spaceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.spaceForm.value,
      images: this.imagePreviews, // s'assurer qu'on utilise les images actuelles
    };

    if (this.editingSpace) {
      payload.typeEspacesId = parseInt(payload.typeEspacesId);
      this.espaceService.update(this.editingSpace.id,payload).subscribe({
        next: (response) => {
          console.log('Space created successfully', response);
          this.spaceCreated.emit(response);
          this.isLoading = false;
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating space', error);
          this.isLoading = false;
        },
      });
    } else {
      payload.typeEspacesId = parseInt(payload.typeEspacesId);
      this.espaceService.create(payload).subscribe({
        next: (response) => {
          console.log('Space created successfully', response);
          this.spaceCreated.emit(response);
          this.isLoading = false;
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating space', error);
          this.isLoading = false;
        },
      });
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  onImageSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.imagePreviews.push(result);
        this.spaceForm.get('images')?.setValue(this.imagePreviews);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.spaceForm.get('images')?.setValue(this.imagePreviews);
  }
}