import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StoreService } from '../../../../../../core/services/store.service';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-branding-colors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <main class="flex-grow flex items-center justify-center p-4">
        <div class="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Choisissez vos couleurs</h1>
            <p class="mt-2 text-gray-600">Sélectionnez la palette de couleurs de votre organisation.</p>
          </div>

          <div class="space-y-8">
            <div>
              <h3 class="text-lg font-medium text-gray-800 mb-3">Palettes prédéfinies</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div *ngFor="let p of palettes" (click)="selectPalette(p.colors)" class="p-4 border rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                  <div class="flex gap-2 mb-2">
                    <div class="w-8 h-8 rounded-full" [style.backgroundColor]="p.colors.primary"></div>
                    <div class="w-8 h-8 rounded-full" [style.backgroundColor]="p.colors.secondary"></div>
                    <div class="w-8 h-8 rounded-full" [style.backgroundColor]="p.colors.accent"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ p.name }}</span>
                </div>
              </div>
            </div>
            
            <div [formGroup]="customColorsForm">
              <h3 class="text-lg font-medium text-gray-800 mb-3">Couleurs personnalisées</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div *ngFor="let color of ['primary', 'secondary', 'accent']">
                  <div class="flex justify-between items-center">
                    <label class="capitalize text-sm font-medium text-gray-700">{{ color }}</label>
                    <span class="text-sm text-gray-500 font-mono">{{ customColorsForm.get(color)?.value }}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-1">
                    <!-- Input #1 -->
                    <input type="color" [formControlName]="color" class="w-10 h-10 p-0 border-none rounded-md cursor-pointer">
                    
                    <!-- Input #2 -->
                    <input type="text" [formControlName]="color" class="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-10 flex items-center justify-between">
            <button type="button" (click)="previousStep()" class="text-sm font-medium text-gray-600 hover:text-gray-900">Retour</button>
            <button type="button" (click)="nextStep()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">Aperçu</button>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BrandingColorsComponent implements OnInit {
  palettes = [
    { name: 'Cynoia Purple', colors: { primary: '#8B5CF6', secondary: '#6366F1', accent: '#34D399' } },
    { name: 'Ocean Blue', colors: { primary: '#3B82F6', secondary: '#1D4ED8', accent: '#10B981' } },
    { name: 'Sunset Orange', colors: { primary: '#F97316', secondary: '#EA580C', accent: '#FBBF24' } },
  ];
  customColorsForm: FormGroup;

  constructor(private fb: FormBuilder, private store: StoreService, private router: Router) {
    this.customColorsForm = this.fb.group({
      primary: ['#8B5CF6'],
      secondary: ['#6366F1'],
      accent: ['#34D399']
    });
  }

  ngOnInit() {
    // Initialise le formulaire avec les couleurs du store si elles existent
    const currentBranding = this.store.getCurrentState()?.organization?.branding;
    if (currentBranding?.colors) {
      this.customColorsForm.setValue(currentBranding.colors);
    }
  }

  selectPalette(colors: { primary: string; secondary: string; accent: string; }) {
    this.customColorsForm.setValue(colors);
  }

  previousStep() {
    this.router.navigate(['/auth/create-organisation/branding/logo']);
  }

  nextStep() {
    this.store.saveBrandingColors(this.customColorsForm.value as any);
    this.router.navigate(['/auth/create-organisation/branding/preview']);
  }
}