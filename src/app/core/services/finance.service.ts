import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancialKPI {
  totalRevenue: number;
  thisMonth: number;
  pending: number;
  overdue: number;
}

export interface Payment {
  id: string;
  memberName: string;
  memberLocation: string;
  spaceName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  dueDate: Date;
  paidDate: Date | null;
  createdAt: Date;
}

export interface SpaceRevenue {
  id: string;
  name: string;
  reservations: number;
  revenue: number;
  avgPerReservation: number;
}

export interface MemberRevenue {
  id: string;
  name: string;
  email: string;
  reservations: number;
  revenue: number;
  avgPerReservation: number;
  outstandingAmount: number;
}

export interface PaymentMethod {
  name: string;
  count: number;
  percentage: number;
}

export interface FinancialAnalytics {
  avgMonthlyRevenue: number;
  bestMonth: string;
  paymentRate: number;
  avgPaymentDelay: number;
  monthlyRevenues: Array<{ month: string; revenue: number }>;
  paymentStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
}

export interface FinancialDashboard {
  kpi: FinancialKPI;
  payments: Payment[];
  spaceRevenues: SpaceRevenue[];
  memberRevenues: MemberRevenue[];
  paymentMethods: PaymentMethod[];
  analytics: FinancialAnalytics;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/finances`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les données financières du dashboard
   */
  getFinancialDashboard(): Observable<FinancialDashboard> {
    return this.http.get<FinancialDashboard>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Récupère les KPI financiers
   */
  getFinancialKPI(): Observable<FinancialKPI> {
    return this.http.get<FinancialKPI>(`${this.apiUrl}/kpi`);
  }

  /**
   * Récupère l'historique des paiements avec filtres
   */
  getPayments(params?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Observable<{ payments: Payment[]; total: number }> {
    const httpParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams[key] = value.toString();
        }
      });
    }
    return this.http.get<{ payments: Payment[]; total: number }>(`${this.apiUrl}/payments`, { params: httpParams });
  }

  /**
   * Récupère les revenus par espace
   */
  getSpaceRevenues(params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<SpaceRevenue[]> {
    const httpParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams[key] = value.toString();
        }
      });
    }
    return this.http.get<SpaceRevenue[]>(`${this.apiUrl}/revenues/spaces`, { params: httpParams });
  }

  /**
   * Récupère les revenus par membre
   */
  getMemberRevenues(params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<MemberRevenue[]> {
    const httpParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams[key] = value.toString();
        }
      });
    }
    return this.http.get<MemberRevenue[]>(`${this.apiUrl}/revenues/members`, { params: httpParams });
  }

  /**
   * Récupère les analytics financières
   */
  getAnalytics(params?: {
    period?: '3m' | '6m' | '12m' | 'year';
  }): Observable<FinancialAnalytics> {
    return this.http.get<FinancialAnalytics>(`${this.apiUrl}/analytics`, { params });
  }

  /**
   * Exporte les données financières
   */
  exportFinancialData(format: 'csv' | 'excel', params?: {
    startDate?: Date;
    endDate?: Date;
    includePayments?: boolean;
    includeRevenues?: boolean;
  }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/${format}`, params, {
      responseType: 'blob'
    });
  }

  /**
   * Met à jour le statut d'un paiement
   */
  updatePaymentStatus(paymentId: string, status: 'paid' | 'pending' | 'overdue'): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/payments/${paymentId}/status`, { status });
  }

  /**
   * Marque un paiement comme payé
   */
  markPaymentAsPaid(paymentId: string, paymentData: {
    method: string;
    paidDate: Date;
    notes?: string;
  }): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/payments/${paymentId}/paid`, paymentData);
  }

  /**
   * Supprime un paiement
   */
  deletePayment(paymentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payments/${paymentId}`);
  }

  /**
   * Envoie un rappel de paiement
   */
  sendPaymentReminder(paymentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/payments/${paymentId}/reminder`, {});
  }

  /**
   * Génère une facture pour un paiement
   */
  generateInvoice(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/payments/${paymentId}/invoice`, {
      responseType: 'blob'
    });
  }

  /**
   * Récupère les statistiques de paiement par méthode
   */
  getPaymentMethodStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Observable<PaymentMethod[]> {
    const httpParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams[key] = value.toString();
        }
      });
    }
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/stats/payment-methods`, { params: httpParams });
  }

  /**
   * Récupère l'évolution des revenus mensuels
   */
  getMonthlyRevenueEvolution(params?: {
    months?: number;
  }): Observable<Array<{ month: string; revenue: number; previousYear?: number }>> {
    return this.http.get<Array<{ month: string; revenue: number; previousYear?: number }>>(`${this.apiUrl}/evolution/monthly`, { params });
  }

  /**
   * Récupère les prévisions de revenus
   */
  getRevenueForecast(): Observable<{
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  }> {
    return this.http.get<{
      nextMonth: number;
      nextQuarter: number;
      confidence: number;
    }>(`${this.apiUrl}/forecast`);
  }

  /**
   * Utilitaires de formatage
   */
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  formatShortDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short'
    }).format(dateObj);
  }

  /**
   * Calculs utilitaires
   */
  
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  calculatePaymentRate(paid: number, total: number): number {
    if (total === 0) return 0;
    return (paid / total) * 100;
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'mobile money':
      case 'momo':
        return 'text-green-600';
      case 'virement bancaire':
      case 'bank_transfer':
        return 'text-blue-600';
      case 'espèces':
      case 'cash':
        return 'text-yellow-600';
      case 'carte bancaire':
      case 'card':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Méthodes de données simulées (à supprimer en production)
   */
  getMockFinancialData(): FinancialDashboard {
    return {
      kpi: {
        totalRevenue: 170000,
        thisMonth: 0,
        pending: 30000,
        overdue: 15000
      },
      payments: [
        {
          id: '1',
          memberName: 'Marie Diallo',
          memberLocation: 'Location bureau privé - 1 jour',
          spaceName: 'Bureau privé 101',
          amount: 45000,
          status: 'paid',
          method: 'Mobile Money',
          dueDate: new Date('2024-12-15'),
          paidDate: new Date('2024-12-13'),
          createdAt: new Date('2024-12-10')
        },
        {
          id: '2',
          memberName: 'Ahmed Kouassi',
          memberLocation: 'Réservation salle de réunion - 2h',
          spaceName: 'Salle de réunion Alpha',
          amount: 50000,
          status: 'paid',
          method: 'Virement bancaire',
          dueDate: new Date('2024-12-18'),
          paidDate: new Date('2024-12-20'),
          createdAt: new Date('2024-12-15')
        }
      ],
      spaceRevenues: [
        {
          id: '1',
          name: 'Bureau privé 101',
          reservations: 1,
          revenue: 45000,
          avgPerReservation: 45000
        },
        {
          id: '2',
          name: 'Salle de réunion Alpha',
          reservations: 2,
          revenue: 125000,
          avgPerReservation: 62500
        }
      ],
      memberRevenues: [
        {
          id: '1',
          name: 'Marie Diallo',
          email: 'marie.diallo@email.com',
          reservations: 1,
          revenue: 45000,
          avgPerReservation: 45000,
          outstandingAmount: 30000
        },
        {
          id: '2',
          name: 'Ahmed Kouassi',
          email: 'ahmed.kouassi@email.com',
          reservations: 2,
          revenue: 125000,
          avgPerReservation: 62500,
          outstandingAmount: 0
        }
      ],
      paymentMethods: [
        { name: 'Mobile Money', count: 1, percentage: 60 },
        { name: 'Virement bancaire', count: 2, percentage: 40 }
      ],
      analytics: {
        avgMonthlyRevenue: 170000,
        bestMonth: 'Jan (0 FCFA)',
        paymentRate: 60.0,
        avgPaymentDelay: 1.7,
        monthlyRevenues: [
          { month: 'Jan', revenue: 170000 },
          { month: 'Fév', revenue: 0 },
          { month: 'Mar', revenue: 0 }
        ],
        paymentStatusDistribution: [
          { status: 'paid', count: 2, percentage: 60 },
          { status: 'pending', count: 1, percentage: 20 },
          { status: 'overdue', count: 1, percentage: 20 }
        ]
      }
    };
  }
}