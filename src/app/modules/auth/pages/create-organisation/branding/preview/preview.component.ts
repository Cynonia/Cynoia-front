import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface BrandingData {
  logo: string;
  logoFileName: string;
  primaryColor: string;
}

@Component({
  selector: 'app-branding-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <main class="flex-grow flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm">
          
          <!-- En-tête -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Aperçu de votre branding</h1>
            <p class="text-gray-600">Voici comment votre organisation apparaîtra dans Cynoia Spaces</p>
          </div>

          <!-- Aperçu du dashboard -->
          <div class="border rounded-xl p-6 bg-gray-50 mb-8">
            <h3 class="text-sm font-medium text-gray-500 mb-4">Aperçu du dashboard</h3>
            <div class="bg-white p-6 rounded-lg shadow-md">
              
              <!-- En-tête avec logo -->
              <div class="flex items-center justify-between mb-6 pb-4 border-b">
                <div class="flex items-center gap-3">
                  <img 
                    [src]="brandingData()?.logo || 'assets/images/logo.svg'" 
                    alt="Logo" 
                    class="h-10 w-10 object-contain rounded-lg">
                  <div>
                    <span class="font-semibold text-gray-900">{{ organizationName() }}</span>
                    <p class="text-sm text-gray-500">Dashboard</p>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                     [style.backgroundColor]="brandingData()?.primaryColor + '20'">
                  <div class="w-3 h-3 rounded-full" [style.backgroundColor]="brandingData()?.primaryColor"></div>
                </div>
              </div>
              
              <!-- Statistiques -->
              <div class="grid grid-cols-3 gap-4 text-center mb-6">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold" [style.color]="brandingData()?.primaryColor">12</p>
                  <p class="text-sm text-gray-500">Espaces</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold" [style.color]="brandingData()?.primaryColor">24</p>
                  <p class="text-sm text-gray-500">Réservations</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold" [style.color]="brandingData()?.primaryColor">8</p>
                  <p class="text-sm text-gray-500">Membres</p>
                </div>
              </div>
              
              <!-- Boutons d'action -->
              <div class="flex gap-3">
                <button class="flex-1 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" 
                        [style.backgroundColor]="brandingData()?.primaryColor">
                  Action principale
                </button>
                <button class="flex-1 px-4 py-2 rounded-lg text-sm font-medium border-2 hover:bg-gray-50 transition-colors" 
                        [style.borderColor]="brandingData()?.primaryColor" 
                        [style.color]="brandingData()?.primaryColor">
                  Action secondaire
                </button>
              </div>
            </div>
          </div>

          <!-- Résumé du branding -->
          <div class="bg-gray-50 rounded-lg p-4 mb-8">
            <h4 class="font-medium text-gray-900 mb-3">Résumé de votre branding</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Logo</span>
                <span class="text-sm font-medium text-gray-900">{{ brandingData()?.logoFileName || 'Aucun logo' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Couleur principale</span>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full" [style.backgroundColor]="brandingData()?.primaryColor"></div>
                  <span class="text-sm font-medium text-gray-900">{{ brandingData()?.primaryColor }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              type="button" 
              (click)="previousStep()" 
              class="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
              </svg>
              Modifier le branding
            </button>
            
            <div class="flex items-center gap-3">
              <button 
                type="button" 
                (click)="finishLater()" 
                class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Configurer plus tard
              </button>
              <button 
                type="button" 
                (click)="applyBranding()" 
                class="inline-flex items-center px-6 py-2 rounded-lg shadow-sm text-sm font-medium text-white hover:opacity-90 transition-opacity" 
                [style.backgroundColor]="brandingData()?.primaryColor">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                Appliquer le branding
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BrandingPreviewComponent implements OnInit {
  brandingData = signal<BrandingData | null>(null);
  organizationName = signal<string>('Mon Organisation');

  constructor(private router: Router) {}

  ngOnInit() {
    // Récupérer les données de branding depuis le localStorage
    const savedBranding = localStorage.getItem('brandingData');
    if (savedBranding) {
      this.brandingData.set(JSON.parse(savedBranding));
    }

    // Récupérer le nom de l'organisation si disponible
    const organizationData = localStorage.getItem('organizationData');
    if (organizationData) {
      const orgData = JSON.parse(organizationData);
      this.organizationName.set(orgData.name || 'Mon Organisation');
    }
  }

  previousStep() {
    this.router.navigate(['/auth/create-organisation/branding']);
  }

  applyBranding() {
    // Ici, on sauvegarderait les données finales et redirigerait vers le dashboard
    // Pour l'instant, on redirige vers l'accueil
    localStorage.removeItem('brandingData');
    localStorage.removeItem('organizationData');
    this.router.navigate(['/dashboard']);
  }

  finishLater() {
    // Sauvegarder le branding comme "à configurer plus tard" et rediriger
    localStorage.removeItem('brandingData');
    localStorage.removeItem('organizationData');
    this.router.navigate(['/dashboard']);
  }
}