import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EspaceService } from '../../../../core/services/espace.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-espace-modal',
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
      <!-- Header avec gradient -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-800 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">
              {{ editingSpace ? 'Modifier espace' : 'Nouvel espace' }}
            </h2>
            <p class="text-purple-100 mt-1">
              {{ editingSpace ? 'Modifiez les informations de votre espace' : 'Creez un nouvel espace pour votre organisation' }}
            </p>
          </div>
          <button
            (click)="closeModal()"
            class="p-2 hover:bg-white/10 rounded-full transition-colors"
            type="button"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form Content avec scroll amélioré -->
      <div class="p-8 overflow-y-auto max-h-[calc(95vh-180px)] scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
        <form [formGroup]="spaceForm" (ngSubmit)="saveSpace()">
          
          <!-- Section Informations de base -->
          <div class="mb-8">
            
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nom -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l&apos;espace <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Salle de reunion A1"
                />
                <div *ngIf="spaceForm.get('name')?.invalid && spaceForm.get('name')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  Le nom est requis
                </div>
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Type d&apos;espace <span class="text-red-500">*</span>
                </label>
                <select
                  formControlName="typeEspacesId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selectionner un type</option>
                  <option value="1">Salle de reunion</option>
                  <option value="2">Bureau</option>
                  <option value="3">Equipement</option>
                </select>
                <div *ngIf="spaceForm.get('typeEspacesId')?.invalid && spaceForm.get('typeEspacesId')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  Le type est requis
                </div>
              </div>

              <!-- Capacité -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Capacite (personnes)
                </label>
                <input
                  type="number"
                  formControlName="capacity"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 12"
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
                  placeholder="Ex: 1er etage, aile gauche"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  formControlName="description"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Decrivez votre espace : ambiance, points forts..."
                ></textarea>
              </div>

              <!-- Status -->
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="status"
                    class="rounded border-gray-300 text-purple-600 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Espace actif</span>
                </label>
              </div>

              <!-- Validation -->
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="validation"
                    class="rounded border-gray-300 text-purple-600 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Validation requise</span>
                </label>
              </div>

              <!-- Upload d&apos;images -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Images de l&apos;espace
                </label>
                
                <!-- Zone de drop stylée -->
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    (change)="onImageSelect($event)"
                    accept="image/*"
                    multiple
                    class="hidden"
                    #fileInput
                  />
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <button
                    type="button"
                    (click)="fileInput.click()"
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Choisir des images
                  </button>
                  <p class="text-sm text-gray-500 mt-2">ou glissez-deposez vos images ici</p>
                </div>

                <!-- Preview améliorée -->
                <div *ngIf="imagePreviews.length > 0" class="mt-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">Images selectionnees ({{imagePreviews.length}})</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div *ngFor="let image of imagePreviews; let i = index" class="relative group">
                      <img
                        [src]="image"
                        [alt]="'Preview ' + (i + 1)"
                        class="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-purple-400 transition-colors"
                      />
                      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                        <button
                          type="button"
                          (click)="removeImage(i)"
                          class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Image {{i + 1}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer amélioré -->
      <div class="flex items-center justify-end gap-4 p-1 border-t bg-gray-50/50">
        
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="closeModal()"
            class="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            (click)="saveSpace()"
            [disabled]="spaceForm.invalid || isLoading"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
          >
            <span *ngIf="!isLoading" class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ editingSpace ? 'Mettre à jour' : "Créer l'espace" }}
            </span>
            <span *ngIf="isLoading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ editingSpace ? 'Mise à jour...' : 'Création...' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  `
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

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.initForm();

    if (this.editingSpace) {
      this.spaceForm.patchValue(this.editingSpace);
      if (this.editingSpace.images) {
        this.imagePreviews = [...this.editingSpace.images];
        this.spaceForm.get('images')?.setValue(this.imagePreviews);
      }
    }
  }

  async initForm(): Promise<void> {
    const currentUser = await firstValueFrom(this.currentUser$);
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

  closeModal(): void {
    this.modalClosed.emit();
  }

  async saveSpace(): Promise<void> {
    if (this.spaceForm.valid) {
      this.isLoading = true;
      try {
        const formData = { ...this.spaceForm.value };
        console.log('Données du formulaire:', formData);
        
        // Ici vous pouvez appeler votre service selon les méthodes disponibles
        // if (this.editingSpace) {
        //   this.spaceUpdated.emit(formData);
        // } else {
        //   this.spaceCreated.emit(formData);
        // }

        this.closeModal();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('Formulaire invalide');
      this.markFormGroupTouched(this.spaceForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onImageSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
          this.spaceForm.get('images')?.setValue(this.imagePreviews);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.spaceForm.get('images')?.setValue(this.imagePreviews);
  }
}
