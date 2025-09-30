import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { EspaceService } from './espace.service';

export interface Space {
  id: string;
  name: string;
  type: 'bureau' | 'salle' | 'equipement';
  description: string;
  capacity: number;
  price: number; // Prix par jour en FCFA
  availability: string; // Horaires de disponibilité
  status: true | false | 'maintenance';
  image?: string; // URL ou base64 de l'image
  features?: string[]; // Caractéristiques supplémentaires
  createdAt: Date;
  updatedAt: Date;
}

export interface SpaceFilter {
  type: 'tous' | 'bureau' | 'salle' | 'equipement';
  status?: true | false | 'maintenance';
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpacesService {
  private spacesSubject = new BehaviorSubject<Space[]>([]);
  public spaces$ = this.spacesSubject.asObservable();

  constructor(private espaceApi: EspaceService) {
    this.refreshFromApi();
  }

  private refreshFromApi(): void {
    // Prefer backend data via EspaceService (ApiService)
    this.espaceApi.getAll().pipe(first()).subscribe({
      next: (res) => {
        const items = (res.data || []).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt)
        }));
        this.spacesSubject.next(items);
      },
      error: (err) => {
        console.warn('Unable to fetch spaces from API, leaving empty list:', err);
        this.spacesSubject.next([]);
      }
    });
  }

  private saveSpaces(_: Space[]): void {
    throw new Error('Local persistence of spaces is deprecated. Use EspaceService.create/update/delete for server-side operations.');
  }

  private initializeWithSampleData(): void {
    const sampleSpaces: Space[] = [
      {
        id: '1',
        name: 'Bureau privé 101',
        type: 'bureau',
        description: 'Bureau privé avec vue sur la ville',
        capacity: 2,
        price: 15000,
        availability: '8h-18h',
        status: true,
        features: ['Wi-Fi', 'Climatisation', 'Vue sur la ville'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Salle de réunion Alpha',
        type: 'salle',
        description: 'Salle équipée projecteur et tableau',
        capacity: 8,
        price: 25000,
        availability: '8h-20h',
        status: true,
        features: ['Projecteur', 'Tableau blanc', 'Vidéoconférence'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Projecteur HD',
        type: 'equipement',
        description: 'Projecteur haute définition portable',
        capacity: 1,
        price: 5000,
        availability: '8h-18h',
        status: true,
        features: ['HD 1080p', 'Portable', 'HDMI/USB'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    // Sample initialization removed. Use API to seed data.
  }

  // Obtenir tous les espaces
  getAllSpaces(): Space[] {
    return this.spacesSubject.value;
  }

  // Obtenir un espace par ID
  getSpaceById(id: string): Space | undefined {
    return this.spacesSubject.value.find(space => space.id === id);
  }

  // Filtrer les espaces
  getFilteredSpaces(filter: SpaceFilter): Space[] {
    let spaces = this.spacesSubject.value;

    // Filtrer par type
    if (filter.type !== 'tous') {
      spaces = spaces.filter(space => space.type === filter.type);
    }

    // Filtrer par statut
    if (filter.status) {
      spaces = spaces.filter(space => space.status === filter.status);
    }

    // Filtrer par recherche
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      spaces = spaces.filter(space => 
        space.name.toLowerCase().includes(searchTerm) ||
        space.description.toLowerCase().includes(searchTerm)
      );
    }

    return spaces;
  }

  // Ajouter un nouvel espace
  addSpace(spaceData: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>): Space {
    throw new Error('Local addSpace deprecated. Use EspaceService.create() to create spaces on the server.');
  }

  // Mettre à jour un espace
  updateSpace(id: string, updates: Partial<Omit<Space, 'id' | 'createdAt'>>): Space | null {
    throw new Error('Local updateSpace deprecated. Use EspaceService.update() to update spaces on the server.');
  }

  // Supprimer un espace
  deleteSpace(id: string): boolean {
    throw new Error('Local deleteSpace deprecated. Use EspaceService.delete() to delete spaces on the server.');
  }

  // Obtenir les statistiques
  getSpaceStats() {
    const spaces = this.spacesSubject.value;
    return {
      total: spaces.length,
      available: spaces.filter(s => s.status === true).length,
      occupied: spaces.filter(s => s.status === false).length,
      maintenance: spaces.filter(s => s.status === 'maintenance').length,
      byType: {
        bureau: spaces.filter(s => s.type === 'bureau').length,
        salle: spaces.filter(s => s.type === 'salle').length,
        equipement: spaces.filter(s => s.type === 'equipement').length
      }
    };
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Méthode pour vider tous les espaces (utile pour les tests)
  clearAllSpaces(): void {
    // Clear in-memory only
    this.spacesSubject.next([]);
  }
}