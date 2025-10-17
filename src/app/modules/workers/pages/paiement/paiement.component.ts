import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationsService } from '../../../../core/services';
import { StoreService } from '../../../../core/services/store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'mobile' | 'card';
}

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="reservationData" class="space-y-6">
      <!-- En-tête -->
      <div class="flex items-center gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Paiement</h1>
          <p class="text-gray-600">Finaliser votre réservation</p>
        </div>
      </div>

      <!-- Récapitulatif de la réservation -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Récapitulatif de la réservation
          </h2>
        </div>

        <div class="p-6 space-y-4">
          <div class="flex justify-between">
            <span class="text-gray-600">Espace</span>
            <span class="font-medium">{{ reservationData.space?.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Date</span>
            <span class="font-medium">{{ formatDate(reservationData.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Heure</span>
            <span class="font-medium">{{ reservationData.startTime }} - {{ reservationData.endTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Durée</span>
            <span class="font-medium">{{ reservationData.duration }}h</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Participants</span>
            <span class="font-medium">{{ reservationData.participants }} personne{{ reservationData.participants > 1 ? 's' : '' }}</span>
          </div>
          
          <div class="border-t pt-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Total à payer</span>
              <span class="text-xl font-bold text-purple-600">{{ reservationData.totalCost | number }} FCFA</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sélection du moyen de paiement -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Choisir une méthode de paiement</h2>
        </div>

        <div class="p-6 space-y-4">
          <div 
            *ngFor="let method of paymentMethods"
            (click)="selectPaymentMethod(method)"
            [class]="selectedPaymentMethod?.id === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'"
            class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center" 
                 [class]="getPaymentIconClass(method.id)">
              <span class="text-white font-bold">{{ method.icon }}</span>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ method.name }}</h3>
              <p class="text-sm text-gray-600">{{ method.description }}</p>
            </div>
            <div class="w-5 h-5 rounded-full border-2" 
                 [class]="selectedPaymentMethod?.id === method.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'">
              <div *ngIf="selectedPaymentMethod?.id === method.id" 
                   class="w-full h-full rounded-full bg-purple-500 flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations de paiement -->
      <div *ngIf="selectedPaymentMethod" class="bg-white rounded-xl border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Informations de paiement
          </h3>
        </div>

        <div class="p-6">
          <!-- Paiement mobile -->
          <div *ngIf="selectedPaymentMethod.type === 'mobile'" class="space-y-4">
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div class="relative">
                <input 
                  id="phoneNumber"
                  type="tel" 
                  [(ngModel)]="paymentData.phoneNumber"
                  placeholder="Ex: 0123456789"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
              <p class="text-xs text-gray-500 mt-1">Vous recevrez un code de confirmation sur ce numéro</p>
            </div>
          </div>

          <!-- Paiement par carte -->
          <div *ngIf="selectedPaymentMethod.type === 'card'" class="space-y-4">
            <div>
              <label for="cardholderName" class="block text-sm font-medium text-gray-700 mb-2">
                Nom sur la carte
              </label>
              <input 
                id="cardholderName"
                type="text" 
                [(ngModel)]="paymentData.cardholderName"
                placeholder="Nom complet"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>

            <div>
              <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Numéro de carte
              </label>
              <input 
                id="cardNumber"
                type="text" 
                [(ngModel)]="paymentData.cardNumber"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration
                </label>
                <input 
                  id="expiryDate"
                  type="text" 
                  [(ngModel)]="paymentData.expiryDate"
                  placeholder="MM/AA"
                  maxlength="5"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
              <div>
                <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input 
                  id="cvv"
                  type="text" 
                  [(ngModel)]="paymentData.cvv"
                  placeholder="123"
                  maxlength="3"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations de sécurité -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p class="text-sm text-blue-800">
            Vos informations de paiement sont sécurisées et chiffrées
          </p>
        </div>
      </div>

      <!-- Bouton de paiement -->
      <button 
        (click)="processPayment()"
        [disabled]="!isPaymentFormValid() || isProcessing"
        class="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
        <svg *ngIf="isProcessing" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a7.646 7.646 0 100 15.292V12"></path>
        </svg>
        <span *ngIf="!isProcessing">Payer {{ reservationData.totalCost | number }} FCFA</span>
        <span *ngIf="isProcessing">Traitement...</span>
      </button>
    </div>

    <!-- État de chargement si pas de données -->
    <div *ngIf="!reservationData" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune réservation en cours</h3>
        <p class="text-gray-600 mb-4">Vous devez d'abord sélectionner un espace à réserver.</p>
        <button 
          (click)="goToSpaces()"
          class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Voir les espaces disponibles
        </button>
      </div>
    </div>
  `
})
export class PaiementComponent implements OnInit {
  reservationData: any = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  isProcessing = false;

  paymentData = {
    phoneNumber: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };

  paymentMethods: PaymentMethod[] = [
    {
      id: 'orange-money',
      name: 'Orange Money',
      description: 'Paiement via Orange Money',
      icon: 'O',
      type: 'mobile'
    },
    {
      id: 'mtn-mobile-money',
      name: 'MTN Mobile Money',
      description: 'Paiement via MTN Mobile Money',
      icon: 'M',
      type: 'mobile'
    },
    {
      id: 'moov-money',
      name: 'Moov Money',
      description: 'Paiement via Moov Money',
      icon: 'M',
      type: 'mobile'
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      description: 'Visa, Mastercard, etc.',
      icon: '💳',
      type: 'card'
    }
  ];

  constructor(
    private router: Router,
    private reservationsService: ReservationsService,
    private store: StoreService,
    private toast: ToastService,
    private authService: AuthService
  ) {
    this.reservationData = this.store.getPendingReservation();
  }

  ngOnInit(): void {
    this.loadReservationData();
  }

  private loadReservationData(): void {
    this.reservationData = this.store.getPendingReservation();
  }

  // Back button removed

  goToSpaces(): void {
    this.router.navigate(['/workers/espaces-disponibles']);
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

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    // Réinitialiser les données de paiement
    this.paymentData = {
      phoneNumber: '',
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    };
  }

  getPaymentIconClass(methodId: string): string {
    switch (methodId) {
      case 'orange-money':
        return 'bg-orange-500';
      case 'mtn-mobile-money':
        return 'bg-yellow-500';
      case 'moov-money':
        return 'bg-blue-500';
      case 'card':
        return 'bg-gray-700';
      default:
        return 'bg-gray-500';
    }
  }

  isPaymentFormValid(): boolean {
    if (!this.selectedPaymentMethod) return false;

    if (this.selectedPaymentMethod.type === 'mobile') {
      return !!this.paymentData.phoneNumber.trim();
    }

    if (this.selectedPaymentMethod.type === 'card') {
      return !!(
        this.paymentData.cardholderName.trim() &&
        this.paymentData.cardNumber.trim() &&
        this.paymentData.expiryDate.trim() &&
        this.paymentData.cvv.trim()
      );
    }

    return false;
  }

  async processPayment(): Promise<void> {
    if (!this.isPaymentFormValid() || !this.reservationData) return;

    this.isProcessing = true;

    try {
      // Simuler le traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userId = this.reservationData.userId ?? this.authService.currentUser?.id;
      const reservation = {
        status: "en-cours",
        espacesId: this.reservationData.space.id,
        startTime: this.reservationData.startTime,
        endTime: this.reservationData.endTime,
        reservationDate: this.reservationData.date,
        userId
      };      

      this.reservationsService.createReservation(reservation,userId).subscribe({
        next: (res) => {
          console.log('Réservation créée avec succès:', res);
        },
        error: (err) => {
          console.error('Erreur lors de la création de la réservation:', err);
        }
      });

      // Préparer les données de confirmation
      const confirmationData = {
        ...this.reservationData,
        paymentMethod: this.selectedPaymentMethod,
        paymentData: { ...this.paymentData },
        paymentId: 'PAY_' + Date.now(),
        status: 'confirmee',
        paidAt: new Date()
      };

  // Save confirmation and clear pending reservation via StoreService
  this.store.savePendingReservation(confirmationData, true);
  this.store.clearPendingReservation();

  // Toast success and redirect to historique-reservations
  this.toast.success('Paiement et réservation confirmés !', 'Succès');
  this.router.navigate(['/workers/historique-reservations']);

    } catch (error) {
      this.toast.error('Erreur lors du paiement', 'Erreur');
      console.error('Erreur lors du paiement:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}