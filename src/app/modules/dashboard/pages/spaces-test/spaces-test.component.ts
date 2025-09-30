import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpacesService } from '../../../../core/services/spaces.service';

@Component({
  selector: 'app-spaces-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Test du Service des Espaces</h2>
      
      <div class="space-y-4">
        <button 
          (click)="loadSpaces()"
          class="bg-blue-500 text-white px-4 py-2 rounded">
          Charger les espaces
        </button>
        
        <button 
          (click)="addSampleSpace()"
          class="bg-green-500 text-white px-4 py-2 rounded">
          Ajouter un espace test
        </button>
        
        <button 
          (click)="clearSpaces()"
          class="bg-red-500 text-white px-4 py-2 rounded">
          Vider tous les espaces
        </button>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Espaces ({{ spaces.length }})</h3>
        <div class="space-y-2">
          <div *ngFor="let space of spaces" class="p-3 border rounded">
            <div class="font-medium">{{ space.name }}</div>
            <div class="text-sm text-gray-600">{{ space.type }} - {{ space.price }} FCFA/jour</div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Statistiques</h3>
        <pre class="bg-gray-100 p-3 rounded text-sm">{{ stats | json }}</pre>
      </div>
    </div>
  `
})
export class SpacesTestComponent implements OnInit {
  spaces: any[] = [];
  stats: any = {};

  constructor(private spacesService: SpacesService) {}

  ngOnInit(): void {
    this.loadSpaces();
    this.spacesService.spaces$.subscribe(spaces => {
      this.spaces = spaces;
      this.stats = this.spacesService.getSpaceStats();
    });
  }

  loadSpaces(): void {
    this.spaces = this.spacesService.getAllSpaces();
    this.stats = this.spacesService.getSpaceStats();
  }

  addSampleSpace(): void {
    this.spacesService.addSpace({
      name: `Bureau Test ${Date.now()}`,
      type: 'bureau',
      description: 'Bureau de test généré automatiquement',
      capacity: Math.floor(Math.random() * 5) + 1,
      price: Math.floor(Math.random() * 50000) + 10000,
      availability: '8h-18h',
  status: true,
      features: ['Wi-Fi', 'Test']
    });
  }

  clearSpaces(): void {
    this.spacesService.clearAllSpaces();
  }
}