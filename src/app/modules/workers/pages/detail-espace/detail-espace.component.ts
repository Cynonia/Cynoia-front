import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpacesService, Space } from '../../../../core/services/spaces.service';
import { EspaceService } from '../../../../core/services/espace.service';
import { Espace } from '../../../../core/models/espace.model';

@Component({
  selector: 'app-detail-espace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./detail-espace.component.html"
})
export class DetailEspaceComponent implements OnInit {
  space: Espace | null = null;
  availableSlots = [
    { time: '08:00 - 10:00', available: true },
    { time: '10:00 - 12:00', available: false },
    { time: '12:00 - 14:00', available: true },
    { time: '14:00 - 16:00', available: true },
    { time: '16:00 - 18:00', available: false },
    { time: '18:00 - 20:00', available: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spacesService: SpacesService,
    private espaceService: EspaceService
  ) {}

  ngOnInit(): void {
    const spaceId = this.route.snapshot.paramMap.get('id');
    this.espaceService.getById(parseInt(spaceId!)).subscribe({
      next: (response) => {
        console.log('Fetched space details:', response);
        this.space = response.data;
      },
      error: (err) => {
        console.error('Error fetching space details:', err);
        this.router.navigate(['/workers/espaces-disponibles']);
      }
    });

  
  }

  // Back button removed

  getSpaceLocation(): string {
    if (!this.space) return '';
    if (this.space.name.toLowerCase().includes('abidjan')) return 'Abidjan';
    if (this.space.name.toLowerCase().includes('cocody')) return 'Cocody';
    if (this.space.name.toLowerCase().includes('plateau')) return 'Plateau';
    if (this.space.name.toLowerCase().includes('marcory')) return 'Marcory';
    return this.space.location || 'Inconnu';
  }

  getSpaceRating(): string {
    return '4.8';
  }

  getReviewCount(): number {
    return 124;
  }

  getTypeLabel(): string {
    if (!this.space) return '';
    switch (this.space.typeEspacesId) {
      case 2:
        return 'Bureau privé';
      case 1:
        return 'Salle de réunion';
      case 3:
        return 'Équipement';
      default:
        return 'Espace';
    }
  }

  showMoreSlots(): void {
    // Afficher plus de créneaux ou naviguer vers le calendrier
    console.log('Afficher plus de créneaux');
  }

  openReservationModal(): void {
    if (this.space) {
      this.router.navigate(['/workers/reservation', this.space.id]);
    }
  }
}