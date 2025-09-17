import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Space {
  id: string;
  name: string;
  type: 'bureau' | 'salle' | 'equipement';
  description: string;
  capacity: number;
  price: number; // Prix par jour en FCFA
  availability: string; // Horaires de disponibilité
  status: 'disponible' | 'occupe' | 'maintenance';
  image?: string; // URL ou base64 de l'image
  features?: string[]; // Caractéristiques supplémentaires
  createdAt: Date;
  updatedAt: Date;
}

export interface SpaceFilter {
  type: 'tous' | 'bureau' | 'salle' | 'equipement';
  status?: 'disponible' | 'occupe' | 'maintenance';
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpacesService {
  private readonly STORAGE_KEY = 'cynoia_spaces';
  private spacesSubject = new BehaviorSubject<Space[]>([]);
  public spaces$ = this.spacesSubject.asObservable();

  constructor() {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    const savedSpaces = localStorage.getItem(this.STORAGE_KEY);
    if (savedSpaces) {
      try {
        const spaces = JSON.parse(savedSpaces).map((space: any) => ({
          ...space,
          createdAt: new Date(space.createdAt),
          updatedAt: new Date(space.updatedAt)
        }));
        this.spacesSubject.next(spaces);
      } catch (error) {
        console.error('Erreur lors du chargement des espaces:', error);
        this.spacesSubject.next([]);
      }
    } else {
      // Données d'exemple pour la première utilisation
      this.initializeWithSampleData();
    }
  }

  private saveSpaces(spaces: Space[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(spaces));
    this.spacesSubject.next(spaces);
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
        status: 'disponible',
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
        status: 'disponible',
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
        status: 'disponible',
        features: ['HD 1080p', 'Portable', 'HDMI/USB'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.saveSpaces(sampleSpaces);
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
    const newSpace: Space = {
      ...spaceData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentSpaces = this.spacesSubject.value;
    const updatedSpaces = [...currentSpaces, newSpace];
    this.saveSpaces(updatedSpaces);
    
    return newSpace;
  }

  // Mettre à jour un espace
  updateSpace(id: string, updates: Partial<Omit<Space, 'id' | 'createdAt'>>): Space | null {
    const currentSpaces = this.spacesSubject.value;
    const spaceIndex = currentSpaces.findIndex(space => space.id === id);
    
    if (spaceIndex === -1) {
      return null;
    }

    const updatedSpace: Space = {
      ...currentSpaces[spaceIndex],
      ...updates,
      updatedAt: new Date()
    };

    const updatedSpaces = [...currentSpaces];
    updatedSpaces[spaceIndex] = updatedSpace;
    this.saveSpaces(updatedSpaces);
    
    return updatedSpace;
  }

  // Supprimer un espace
  deleteSpace(id: string): boolean {
    const currentSpaces = this.spacesSubject.value;
    const filteredSpaces = currentSpaces.filter(space => space.id !== id);
    
    if (filteredSpaces.length === currentSpaces.length) {
      return false; // Espace non trouvé
    }

    this.saveSpaces(filteredSpaces);
    return true;
  }

  // Obtenir les statistiques
  getSpaceStats() {
    const spaces = this.spacesSubject.value;
    return {
      total: spaces.length,
      available: spaces.filter(s => s.status === 'disponible').length,
      occupied: spaces.filter(s => s.status === 'occupe').length,
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
    localStorage.removeItem(this.STORAGE_KEY);
    this.spacesSubject.next([]);
  }
}