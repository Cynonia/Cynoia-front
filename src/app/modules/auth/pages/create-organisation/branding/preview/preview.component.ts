import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Update the path below to the correct relative path where store.service.ts exists, for example:
import { StoreService, AppState } from '../../../../../../core/services/store.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-branding-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col" *ngIf="state$ | async as state">
      <main class="flex-grow flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Aperçu de votre branding</h1>
            <p class="mt-2 text-gray-600">Voici comment votre organisation apparaîtra dans Cynoia Spaces.</p>
          </div>

          <div class="border rounded-lg p-6 bg-gray-50">
            <h3 class="text-sm font-medium text-gray-500 mb-4">Aperçu du dashboard</h3>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <img [src]="state.organization?.branding?.logo || 'assets/images/logo.svg'" alt="Logo" class="h-8 w-8 object-contain">
                  <span class="font-semibold text-gray-800">{{ state.organization?.name }}</span>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 text-center">
                <div><p class="text-2xl font-bold" [style.color]="state.organization?.branding?.colors?.primary">12</p><p class="text-sm text-gray-500">Espaces</p></div>
                <div><p class="text-2xl font-bold" [style.color]="state.organization?.branding?.colors?.primary">24</p><p class="text-sm text-gray-500">Réservations</p></div>
                <div><p class="text-2xl font-bold" [style.color]="state.organization?.branding?.colors?.primary">8</p><p class="text-sm text-gray-500">Membres</p></div>
              </div>
              <div class="mt-6 flex gap-3">
                <button class="flex-1 text-white px-4 py-2 rounded-md text-sm font-medium" [style.backgroundColor]="state.organization?.branding?.colors?.primary">Action principale</button>
                <button class="flex-1 px-4 py-2 rounded-md text-sm font-medium border" [style.borderColor]="state.organization?.branding?.colors?.primary" [style.color]="state.organization?.branding?.colors?.primary">Action secondaire</button>
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button type="button" (click)="previousStep()" class="text-sm font-medium text-gray-600 hover:text-gray-900">Modifier les couleurs</button>
            <div class="flex items-center gap-3">
              <button type="button" (click)="finishLater()" class="text-sm font-medium text-gray-600 hover:text-gray-900">Configurer plus tard</button>
              <button type="button" (click)="applyBranding()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white" [style.backgroundColor]="state.organization?.branding?.colors?.primary">Appliquer le branding</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BrandingPreviewComponent implements OnInit {
  state$!: Observable<AppState>;
  constructor(private store: StoreService, private router: Router) {}

  ngOnInit() { this.state$ = this.store.getState(); }
  previousStep() { this.router.navigate(['/auth/create-organisation/branding/colors']); }
  applyBranding() { this.router.navigate(['/dashboard']); }
  finishLater() { this.router.navigate(['/dashboard']); }
}