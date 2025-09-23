import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { BrandingService, Organization } from '../../../../core/services/branding.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">Paramètres</h2>
      
      <!-- Organisation Settings -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Organisation</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'organisation</label>
            <input type="text" [(ngModel)]="organizationName" class="w-full border border-gray-300 rounded-lg px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea [(ngModel)]="organizationDescription" class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Branding Settings -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Branding</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div class="flex items-center gap-4">
              <div *ngIf="brandingLogo; else defaultLogo" class="w-16 h-16 rounded-lg overflow-hidden">
                <img [src]="brandingLogo" alt="Logo" class="w-full h-full object-contain" />
              </div>
              <ng-template #defaultLogo>
                <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold">{{ brandingInitials }}</span>
                </div>
              </ng-template>
              <button class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200" (click)="changeLogo()">
                Changer le logo
              </button>
            </div>
            <!-- <p class="text-sm text-gray-500 mt-2">Logo par défaut de Cynoia utilisé</p> -->
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
            <div class="flex items-center gap-2">
              <input type="color" [(ngModel)]="primaryColor" class="w-12 h-10 border border-gray-300 rounded">
              <span class="text-sm text-gray-600">{{ primaryColor }} (Couleur par défaut Cynoia)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParametresComponent implements OnInit {
  organizationName = '';
  organizationDescription = '';
  brandingLogo: string | null = null;
  primaryColor = '#7C3AED'; // Couleur par défaut
  brandingInitials = '';

  constructor(
    private authService: AuthService,
    private brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    // Récupérer organisation et branding à partir du service
    const org: Organization | null = this.brandingService.currentOrganization;

    if (org) {
      this.organizationName = org.name || '';
      this.organizationDescription = org.description || '';
      this.brandingLogo = org.logo || null;
      this.primaryColor = org.primaryColor || this.primaryColor;
      this.brandingInitials = this.getInitials(org.name || '');
    }
  }

  changeLogo(): void {
    // TODO : ouvrir un modal ou file picker pour changer le logo
    alert('Changer le logo - fonctionnalité à implémenter');
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
