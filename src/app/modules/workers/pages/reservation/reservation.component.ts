import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SpacesService, Space } from '../../../../core/services/spaces.service';

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
  template: `
    <div *ngIf="space" class="space-y-6">
      <!-- Navigation de retour -->
      <div class="flex items-center gap-3">
        <button 
          (click)="goBack()" 
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Réserver l'espace</h1>
          <p class="text-gray-600">{{ space.name }}</p>
        </div>
      </div>

      <!-- Récapitulatif de l'espace -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
        <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            *ngIf="space.image" 
            [src]="space.image" 
            [alt]="space.name" 
            class="w-full h-full object-cover">
          <div 
            *ngIf="!space.image" 
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">{{ space.name }}</h3>
          <p class="text-sm text-gray-600">Capacité {{ space.capacity }} personnes</p>
          <p class="text-sm text-purple-600 font-medium">{{ space.price | number }} FCFA/jour</p>
        </div>
      </div>

      <!-- Formulaire de réservation -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Détails de la réservation
          </h2>
        </div>

        <form (ngSubmit)="proceedToPayment()" class="p-6 space-y-6">
          <!-- Date de réservation -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
              Date de réservation
            </label>
            <input 
              id="date"
              type="date" 
              [(ngModel)]="formData.date"
              name="date"
              [min]="today"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
          </div>

          <!-- Créneau horaire -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Créneau horaire
            </label>
            <p class="text-sm text-gray-500 mb-3">Choisir un créneau</p>
            
            <!-- Grille des créneaux -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <button 
                *ngFor="let slot of availableTimeSlots"
                type="button"
                (click)="selectTimeSlot(slot)"
                [class]="selectedTimeSlot?.id === slot.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                class="p-3 text-sm font-medium border rounded-lg transition-colors">
                {{ slot.label }}
              </button>
            </div>

            <!-- Créneaux personnalisés -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début
                </label>
                <input 
                  id="startTime"
                  type="time" 
                  [(ngModel)]="formData.startTime"
                  name="startTime"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
              <div>
                <label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <input 
                  id="endTime"
                  type="time" 
                  [(ngModel)]="formData.endTime"
                  name="endTime"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
              <div>
                <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
                  Durée (heures)
                </label>
                <div class="flex items-center">
                  <button 
                    type="button"
                    (click)="decrementDuration()"
                    class="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50">
                    -
                  </button>
                  <input 
                    id="duration"
                    type="number" 
                    [(ngModel)]="formData.duration"
                    name="duration"
                    min="1"
                    max="12"
                    class="block w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <button 
                    type="button"
                    (click)="incrementDuration()"
                    class="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Nombre de participants -->
          <div>
            <label for="participants" class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de participants
            </label>
            <div class="flex items-center">
              <button 
                type="button"
                (click)="decrementParticipants()"
                [disabled]="formData.participants <= 1"
                class="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                -
              </button>
              <input 
                id="participants"
                type="number" 
                [(ngModel)]="formData.participants"
                name="participants"
                [min]="1"
                [max]="space.capacity"
                class="block w-20 px-3 py-2 border-t border-b border-gray-300 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <button 
                type="button"
                (click)="incrementParticipants()"
                [disabled]="formData.participants >= space.capacity"
                class="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
                +
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Maximum {{ space.capacity }} personnes</p>
          </div>

          <!-- Notes optionnelles -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea 
              id="notes"
              [(ngModel)]="formData.notes"
              name="notes"
              rows="3"
              placeholder="Besoins spéciaux, demandes particulières..."
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
          </div>

          <!-- Équipements supplémentaires -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Équipements supplémentaires</h3>
            <div class="space-y-3">
              <label 
                *ngFor="let equipment of additionalEquipment"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                [class.bg-purple-50]="isEquipmentSelected(equipment.id)"
                [class.border-purple-300]="isEquipmentSelected(equipment.id)">
                <div class="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    [value]="equipment.id"
                    (change)="toggleEquipment(equipment.id)"
                    [checked]="isEquipmentSelected(equipment.id)"
                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                  <div>
                    <div class="font-medium text-gray-900">{{ equipment.name }}</div>
                    <div *ngIf="equipment.included" class="text-sm text-green-600">Inclus gratuitement</div>
                  </div>
                </div>
                <div class="text-right">
                  <div *ngIf="!equipment.included" class="text-purple-600 font-medium">
                    +{{ equipment.price | number }} FCFA
                  </div>
                  <div *ngIf="equipment.included" class="text-green-600 text-sm">
                    Inclus
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Récapitulatif des coûts -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Espace ({{ formData.duration }}h)</span>
                <span class="font-medium">{{ getSpaceCost() | number }} FCFA</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Équipements supplémentaires</span>
                <span class="font-medium">{{ getEquipmentCost() | number }} FCFA</span>
              </div>
              <div class="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-purple-600">{{ getTotalCost() | number }} FCFA</span>
              </div>
            </div>
          </div>

          <!-- Bouton de confirmation -->
          <button 
            type="submit"
            [disabled]="!isFormValid()"
            class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            Continuer vers le paiement
          </button>
        </form>
      </div>
    </div>
  `
})
export class ReservationComponent implements OnInit {
  space: Space | null = null;
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
    additionalEquipment: []
  };

  availableTimeSlots = [
    { id: '08-10', label: '08:00 - 10:00', available: true },
    { id: '10-12', label: '10:00 - 12:00', available: false },
    { id: '12-14', label: '12:00 - 14:00', available: true },
    { id: '14-16', label: '14:00 - 16:00', available: true },
    { id: '16-18', label: '16:00 - 18:00', available: false },
    { id: '18-20', label: '18:00 - 20:00', available: true }
  ];

  additionalEquipment = [
    { id: 'projector', name: 'Projecteur HD', price: 0, included: true },
    { id: 'flipchart', name: 'Flipchart', price: 0, included: true },
    { id: 'videoconf', name: 'Matériel de visioconférence', price: 5000, included: false },
    { id: 'printer', name: 'Imprimante/Scanner', price: 2000, included: false },
    { id: 'whiteboard', name: 'Tableau blanc', price: 0, included: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spacesService: SpacesService
  ) {}

  ngOnInit(): void {
    const spaceId = this.route.snapshot.paramMap.get('id');
    if (spaceId) {
      this.space = this.spacesService.getSpaceById(spaceId) || null;
      if (this.space) {
        this.formData.spaceId = this.space.id;
      } else {
        this.router.navigate(['/workers/espaces-disponibles']);
      }
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
    if (this.space && this.formData.participants < this.space.capacity) {
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
    return this.space.price * this.formData.duration;
  }

  getEquipmentCost(): number {
    return this.formData.additionalEquipment.reduce((total, equipmentId) => {
      const equipment = this.additionalEquipment.find(eq => eq.id === equipmentId);
      return total + (equipment?.price || 0);
    }, 0);
  }

  getTotalCost(): number {
    return this.getSpaceCost() + this.getEquipmentCost();
  }

  isFormValid(): boolean {
    return !!(this.formData.date && 
             this.formData.startTime && 
             this.formData.endTime && 
             this.formData.duration > 0 && 
             this.formData.participants > 0);
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
        selectedEquipment: this.formData.additionalEquipment.map(id => 
          this.additionalEquipment.find(eq => eq.id === id)
        ).filter(eq => eq)
      };

      localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
      this.router.navigate(['/workers/paiement']);
    }
  }
}