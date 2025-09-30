import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SpacesService, Space } from '../../../../core/services/spaces.service';
import { Espace } from '../../../../core/models/espace.model';
import { EspaceService } from '../../../../core/services/espace.service';
import { StoreService } from '../../../../core/services/store.service';

interface ReservationFormData {
  spaceId: string;
  date: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  duration: number;
  participants: number;
  notes: string;
  additionalEquipment: string[];
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.component.html',
})
export class ReservationComponent implements OnInit {
  space: Espace | null = null;
  today = new Date().toISOString().split('T')[0];
  selectedTimeSlot: any = null;

  formData: ReservationFormData = {
    spaceId: '',
    date: this.today,
    timeSlot: '',
    startTime: '09:00',
    endTime: '10:00',
    duration: 1,
    participants: 1,
    notes: '',
    additionalEquipment: [],
  };

  availableTimeSlots = [
    { id: '08-10', label: '08:00 - 10:00', available: true },
    { id: '10-12', label: '10:00 - 12:00', available: false },
    { id: '12-14', label: '12:00 - 14:00', available: true },
    { id: '14-16', label: '14:00 - 16:00', available: true },
    { id: '16-18', label: '16:00 - 18:00', available: false },
    { id: '18-20', label: '18:00 - 20:00', available: true },
  ];

  additionalEquipment = [
    { id: 'projector', name: 'Projecteur HD', price: 0, included: true },
    { id: 'flipchart', name: 'Flipchart', price: 0, included: true },
    {
      id: 'videoconf',
      name: 'Matériel de visioconférence',
      price: 5000,
      included: false,
    },
    { id: 'printer', name: 'Imprimante/Scanner', price: 2000, included: false },
    { id: 'whiteboard', name: 'Tableau blanc', price: 0, included: true },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spacesService: EspaceService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    const spaceId = this.route.snapshot.paramMap.get('id');
    if (spaceId) {
      this.spacesService.getById(parseInt(spaceId!)).subscribe({
        next: (response) => {
          console.log('Fetched space details:', response);
          this.space = response.data;
          this.formData.spaceId = this.space.id.toString();
        },
        error: (err) => {
          console.error('Error fetching space details:', err);
        },
      });
    }
  }

  goBack(): void {
    if (this.space) {
      this.router.navigate(['/workers/detail-espace', this.space.id]);
    } else {
      this.router.navigate(['/workers/espaces-disponibles']);
    }
  }

  selectTimeSlot(slot: any): void {
    if (slot.available) {
      this.selectedTimeSlot = slot;
      this.formData.timeSlot = slot.id;

      // Mettre à jour les heures de début et fin
      const [start, end] = slot.label.split(' - ');
      this.formData.startTime = start;
      this.formData.endTime = end;

      // Calculer la durée
      const startHour = parseInt(start.split(':')[0]);
      const endHour = parseInt(end.split(':')[0]);
      this.formData.duration = endHour - startHour;
    }
  }

  incrementDuration(): void {
    if (this.formData.duration < 12) {
      this.formData.duration++;
    }
  }

  decrementDuration(): void {
    if (this.formData.duration > 1) {
      this.formData.duration--;
    }
  }

  incrementParticipants(): void {
    if (this.space && this.formData.participants < this.space.capacity!) {
      this.formData.participants++;
    }
  }

  decrementParticipants(): void {
    if (this.formData.participants > 1) {
      this.formData.participants--;
    }
  }

  toggleEquipment(equipmentId: string): void {
    const index = this.formData.additionalEquipment.indexOf(equipmentId);
    if (index > -1) {
      this.formData.additionalEquipment.splice(index, 1);
    } else {
      this.formData.additionalEquipment.push(equipmentId);
    }
  }

  isEquipmentSelected(equipmentId: string): boolean {
    return this.formData.additionalEquipment.includes(equipmentId);
  }

  getSpaceCost(): number {
    if (!this.space) return 0;
    return this.space.pricePerHour! * this.formData.duration;
  }

  getEquipmentCost(): number {
    return this.formData.additionalEquipment.reduce((total, equipmentId) => {
      const equipment = this.additionalEquipment.find(
        (eq) => eq.id === equipmentId
      );
      return total + (equipment?.price || 0);
    }, 0);
  }

  getTotalCost(): number {
    return this.getSpaceCost() + this.getEquipmentCost();
  }

  isFormValid(): boolean {
    return !!(
      this.formData.date &&
      this.formData.startTime &&
      this.formData.endTime &&
      this.formData.duration > 0 &&
      this.formData.participants > 0
    );
  }

  proceedToPayment(): void {
    if (this.isFormValid()) {
      // Sauvegarder les données de réservation dans le service ou localStorage
      const reservationData = {
        ...this.formData,
        space: this.space,
        totalCost: this.getTotalCost(),
        spaceCost: this.getSpaceCost(),
        equipmentCost: this.getEquipmentCost(),
        selectedEquipment: this.formData.additionalEquipment
          .map((id) => this.additionalEquipment.find((eq) => eq.id === id))
          .filter((eq) => eq),
      };

      // Store pending reservation in StoreService (in-memory + optional sessionStorage)
      this.store.savePendingReservation(reservationData, true);
      this.router.navigate(['/workers/paiement']);
    }
  }
}
