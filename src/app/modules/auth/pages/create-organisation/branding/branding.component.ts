import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ColorPalette {
  name: string;
  color: string;
  selected?: boolean;
}

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        
        <!-- En-tête -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21ZM17 11V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V11H17Z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Personnalisez votre branding</h2>
          <p class="text-gray-600">Ajoutez votre logo et choisissez votre couleur principale</p>
        </div>

        <!-- Section Logo -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Logo de votre organisation</h3>
          
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-purple-400 transition-colors">
            <div *ngIf="!selectedLogo(); else logoPreview">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <p class="text-gray-500 mb-4">Glissez votre logo ici ou</p>
              <label class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Parcourir les fichiers
                <input type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*">
              </label>
              <p class="text-xs text-gray-400 mt-2">PNG, JPG ou SVG (max. 2MB)</p>
            </div>
            
            <ng-template #logoPreview>
              <div class="relative">
                <img [src]="selectedLogo()" [alt]="logoFileName()" class="max-w-32 max-h-32 mx-auto rounded-lg shadow-md">
                <button 
                  (click)="removeLogo()"
                  class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
                <p class="text-sm text-gray-600 mt-2">{{ logoFileName() }}</p>
                <label class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors mt-2 text-sm">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" />
                  </svg>
                  Modifier
                  <input type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*">
                </label>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Section Couleur -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Couleur principale</h3>
          
          <!-- Couleurs prédéfinies -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div *ngFor="let palette of predefinedColors" 
                 (click)="selectColor(palette.color)"
                 class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                 [class.border-purple-500]="selectedColor() === palette.color"
                 [class.border-gray-200]="selectedColor() !== palette.color">
              <div class="flex items-center space-x-3">
                <div [style.background-color]="palette.color" class="w-8 h-8 rounded-full"></div>
                <span class="font-medium text-gray-900">{{ palette.name }}</span>
              </div>
            </div>
          </div>

          <!-- Couleur personnalisée -->
          <div class="border-2 border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">Couleur personnalisée</h4>
            <div class="flex items-center space-x-4">
              <input 
                type="color" 
                [value]="customColor()"
                (input)="onCustomColorChange($event)"
                class="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer">
              <div class="flex-1">
                <input 
                  type="text" 
                  [value]="customColor()"
                  (input)="onCustomColorInput($event)"
                  placeholder="#000000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <button 
                (click)="selectColor(customColor())"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Utiliser
              </button>
            </div>
          </div>

          <!-- Aperçu de la couleur sélectionnée -->
          <div *ngIf="selectedColor()" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div [style.background-color]="selectedColor()" class="w-6 h-6 rounded-full"></div>
              <span class="text-sm font-medium text-gray-700">Couleur sélectionnée : {{ selectedColor() }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-6 border-t">
          <button 
            (click)="goBack()"
            class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
            Retour
          </button>
          
          <button 
            (click)="continueToPreview()"
            [disabled]="!canContinue()"
            [class.opacity-50]="!canContinue()"
            [class.cursor-not-allowed]="!canContinue()"
            class="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:hover:bg-purple-600">
            Aperçu
            <svg class="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BrandingComponent {
  selectedLogo = signal<string | null>(null);
  logoFileName = signal<string>('');
  selectedColor = signal<string>('');
  customColor = signal<string>('#9333ea');

  predefinedColors: ColorPalette[] = [
    { name: 'Cynoia Purple', color: '#9333ea' },
    { name: 'Ocean Blue', color: '#0ea5e9' },
    { name: 'Emerald Green', color: '#10b981' },
    { name: 'Sunset Orange', color: '#f59e0b' },
    { name: 'Ruby Red', color: '#ef4444' },
    { name: 'Slate Gray', color: '#64748b' }
  ];

  constructor(private router: Router) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 2MB');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide.');
        return;
      }

      this.logoFileName.set(file.name);

      // Lire le fichier et créer une URL de prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedLogo.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.selectedLogo.set(null);
    this.logoFileName.set('');
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  onCustomColorChange(event: any): void {
    this.customColor.set(event.target.value);
  }

  onCustomColorInput(event: any): void {
    const value = event.target.value;
    if (value.match(/^#[0-9A-F]{6}$/i)) {
      this.customColor.set(value);
    }
  }

  canContinue(): boolean {
    return this.selectedLogo() !== null && this.selectedColor() !== '';
  }

  goBack(): void {
    this.router.navigate(['/auth/create-organisation/new']);
  }

  continueToPreview(): void {
    if (this.canContinue()) {
      // Sauvegarder les données de branding (localStorage temporaire ou service)
      const brandingData = {
        logo: this.selectedLogo(),
        logoFileName: this.logoFileName(),
        primaryColor: this.selectedColor()
      };
      
      localStorage.setItem('brandingData', JSON.stringify(brandingData));
      
      this.router.navigate(['/auth/create-organisation/preview']);
    }
  }
}