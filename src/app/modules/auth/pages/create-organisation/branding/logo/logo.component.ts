import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Update the path below to the correct relative path where store.service.ts exists
import { StoreService } from '../../../../../../core/services/store.service';

@Component({
  selector: 'app-branding-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <main class="flex-grow flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm">
          <div class="text-center mb-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-3v6m0 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8"></path></svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Ajoutez votre logo</h1>
            <p class="mt-2 text-gray-600">Personnalisez votre espace avec votre identité visuelle.</p>
          </div>

          <div class="mt-8">
            <!-- Affiche l'aperçu si un logo est sélectionné -->
            <div *ngIf="logoPreviewUrl" class="text-center">
              <p class="text-sm font-medium text-gray-700 mb-3">Aperçu du logo :</p>
              <div class="relative inline-block p-4 border border-gray-200 rounded-lg">
                <img [src]="logoPreviewUrl" alt="Aperçu du logo" class="max-h-32 mx-auto">
                <button (click)="removeLogo()" class="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <!-- Affiche la zone d'upload si aucun logo n'est sélectionné -->
            <div *ngIf="!logoPreviewUrl" 
                 class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors"
                 (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)">
              <p class="mb-2 text-gray-500">Glissez votre logo ici ou</p>
              <input type="file" #fileInput class="hidden" accept="image/png, image/jpeg, image/svg+xml" (change)="onFileSelected($event)">
              <button type="button" (click)="fileInput.click()" class="font-medium text-purple-600 hover:text-purple-500">Parcourir les fichiers</button>
              <p class="mt-2 text-xs text-gray-500">PNG, JPG ou SVG (max. 2MB)</p>
            </div>
          </div>

          <div class="mt-8 flex items-center justify-between">
            <button type="button" (click)="skipStep()" class="text-sm font-medium text-gray-600 hover:text-gray-900">Passer cette étape</button>
            <button type="button" (click)="nextStep()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">Suivant</button>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BrandingLogoComponent implements OnInit {
  logoPreviewUrl: string | null = null;
  private selectedLogoData: string | null = null;

  constructor(private store: StoreService, private router: Router) {}

  ngOnInit() {
    // Pré-remplir si un logo existe déjà dans le store
    const currentLogo = this.store.getCurrentState()?.organization?.branding?.logo;
    if (currentLogo) {
      this.logoPreviewUrl = currentLogo;
      this.selectedLogoData = currentLogo;
    }
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }
  onDragLeave(event: DragEvent) { event.preventDefault(); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.handleFile(file);
  }

  private handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 2MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedLogoData = e.target.result;
      this.logoPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.logoPreviewUrl = null;
    this.selectedLogoData = null;
    // Optionnel: vider aussi le store immédiatement
    // this.store.saveBrandingLogo(''); 
  }

  skipStep() {
    this.store.saveBrandingLogo(''); // S'assurer qu'aucun logo n'est sauvegardé
    this.router.navigate(['/auth/create-organisation/branding/colors']);
  }

  nextStep() {
    if (this.selectedLogoData) {
      this.store.saveBrandingLogo(this.selectedLogoData);
    }
    this.router.navigate(['/auth/create-organisation/branding/colors']);
  }
}