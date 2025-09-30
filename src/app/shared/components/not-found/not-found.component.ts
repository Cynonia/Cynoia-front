import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="flex flex-col items-center justify-center h-screen">
  <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
      <p class="text-xl text-gray-700 mb-6">Page non trouvée</p>
      <div class="flex gap-4">
  <button (click)="goBack()" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-medium">Retour à la page précédente</button>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {
  constructor(private location: Location) {}
  goBack() {
    this.location.back();
  }
}
