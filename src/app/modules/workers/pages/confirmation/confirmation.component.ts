import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmationData" class="max-w-2xl mx-auto space-y-6">
      <!-- Icône de succès -->
      <div class="text-center py-8">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
        <p class="text-gray-600">Votre réservation a été confirmée. Vous recevrez un email de confirmation sous peu.</p>
      </div>

      <!-- Détails de la réservation -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="bg-purple-600 text-white p-6">
          <h2 class="text-xl font-semibold">{{ confirmationData.space?.name }}</h2>
          <p class="text-purple-100">{{ formatDate(confirmationData.date) }} • {{ confirmationData.startTime }} - {{ confirmationData.endTime }}</p>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-gray-500">Espace</dt>
              <dd class="font-medium text-gray-900">{{ confirmationData.space?.name }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Date</dt>
              <dd class="font-medium text-gray-900">{{ formatDate(confirmationData.date) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Horaire</dt>
              <dd class="font-medium text-gray-900">{{ confirmationData.startTime }} - {{ confirmationData.endTime }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Durée</dt>
              <dd class="font-medium text-gray-900">{{ confirmationData.duration }}h</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Participants</dt>
              <dd class="font-medium text-gray-900">{{ confirmationData.participants }} personne{{ confirmationData.participants > 1 ? 's' : '' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Total payé</dt>
              <dd class="font-medium text-gray-900">{{ confirmationData.totalCost | number }} FCFA</dd>
            </div>
          </div>

          <div *ngIf="confirmationData.notes" class="border-t pt-4">
            <dt class="text-sm text-gray-500 mb-1">Notes</dt>
            <dd class="text-gray-900">{{ confirmationData.notes }}</dd>
          </div>

          <div *ngIf="hasSelectedEquipment()" class="border-t pt-4">
            <dt class="text-sm text-gray-500 mb-2">Équipements supplémentaires</dt>
            <dd class="space-y-1">
              <div *ngFor="let equipment of getSelectedEquipment()" 
                   class="flex justify-between items-center text-sm">
                <span class="text-gray-900">{{ equipment.name }}</span>
                <span class="text-gray-600">
                  {{ equipment.included ? 'Inclus' : '+' + (equipment.price | number) + ' FCFA' }}
                </span>
              </div>
            </dd>
          </div>
        </div>
      </div>

      <!-- Informations de paiement -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Détails du paiement</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <dt class="text-sm text-gray-500">Méthode de paiement</dt>
            <dd class="font-medium text-gray-900">{{ confirmationData.paymentMethod?.name }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">ID de transaction</dt>
            <dd class="font-medium text-gray-900 font-mono">{{ confirmationData.paymentId }}</dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Statut</dt>
            <dd>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Confirmé
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm text-gray-500">Date de paiement</dt>
            <dd class="font-medium text-gray-900">{{ formatDateTime(confirmationData.paidAt) }}</dd>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button 
          (click)="goToReservations()"
          class="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Voir mes réservations
        </button>
        <button 
          (click)="goToSpaces()"
          class="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Réserver un autre espace
        </button>
      </div>

      <!-- Informations utiles -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">Informations importantes :</p>
            <ul class="space-y-1">
              <li>• Un email de confirmation a été envoyé à votre adresse</li>
              <li>• Veuillez arriver 5 minutes avant l'heure de début</li>
              <li>• Annulation gratuite jusqu'à 24h avant le début</li>
              <li>• En cas de problème, contactez le support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- État si pas de données -->
    <div *ngIf="!confirmationData" class="max-w-md mx-auto text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune confirmation trouvée</h3>
      <p class="text-gray-600 mb-6">Il semble qu'il n'y ait pas de réservation confirmée récemment.</p>
      <button 
        (click)="goToSpaces()"
        class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
        Voir les espaces disponibles
      </button>
    </div>
  `
})
export class ConfirmationComponent implements OnInit {
  confirmationData: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadConfirmationData();
  }

  private loadConfirmationData(): void {
    const savedData = localStorage.getItem('reservationConfirmation');
    if (savedData) {
      this.confirmationData = JSON.parse(savedData);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hasSelectedEquipment(): boolean {
    return this.confirmationData?.selectedEquipment?.length > 0;
  }

  getSelectedEquipment(): any[] {
    return this.confirmationData?.selectedEquipment || [];
  }

  goToReservations(): void {
    this.router.navigate(['/workers/mes-reservations']);
  }

  goToSpaces(): void {
    this.router.navigate(['/workers/espaces-disponibles']);
  }
}