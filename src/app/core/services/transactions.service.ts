import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, first, of, switchMap, map, tap, catchError } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { AuthService } from './auth.service';

export type TransactionStatus = 'paye' | 'en-attente' | 'echec' | 'rembourse';

export interface Transaction {
  id: number | string;
  amount: number;
  status?: TransactionStatus | string; // normalize in UI if needed
  paymentMethod?: string; // mobile-money | carte-bancaire | virement | ...
  createdAt?: Date;
  reservation?: any; // may embed reservation with espace
  description?: string;
  paymentMode?: { id: number; name: string };
  totalAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  /**
   * Récupère les transactions d'un utilisateur (pour Workers)
   */
  getTransactionsByUserId(userId: number): Observable<Transaction[]> {
    return this.api.get<any[]>(`${this.endpoint}/user/${userId}`).pipe(
      map((resp) => this.extractData<any[]>(resp)),
      map((items) => (items || []).map(this.mapTransaction))
    );
  }
  private readonly endpoint = '/transactions';
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private api: ApiService, private auth: AuthService) {
    // Do not auto-fetch transactions; only fetch when explicitly called from a component/page
  }

  private extractData<T>(resp: any): T {
    if (resp && Array.isArray(resp)) return resp as T;
    if (resp && typeof resp === 'object' && 'data' in resp) return resp.data as T;
    return resp as T;
  }

  refreshFromApi(): void {
    this.auth.currentUser$.pipe(
      first(),
      switchMap((user) => {
        const entityId = user?.entity?.id;
        if (!entityId) return of({ data: [], success: true } as ApiResponse<any[]>);
        return this.api.get<any[]>(`${this.endpoint}/entity/${entityId}`);
      }),
      map((resp) => this.extractData<any[]>(resp)),
      map((items) => (items || []).map(this.mapTransaction)),
      tap((txs) => this.transactionsSubject.next(txs)),
      catchError((err) => {
        console.error('Failed to load transactions:', err);
        this.transactionsSubject.next([]);
        return of([]);
      })
    ).subscribe();
  }

  getTransactionsSnapshot(): Transaction[] {
    return this.transactionsSubject.value;
  }

  private mapTransaction = (t: any): Transaction => {
    const createdAt = t?.createdAt ? new Date(t.createdAt) : undefined;
    const amount = typeof t?.amount === 'number' ? t.amount : Number(t?.amount || 0);
    const statusRaw = (t?.status || '').toString().toLowerCase();
    // Normalize a few common variants
    let status: TransactionStatus | undefined = undefined;
    if (statusRaw.includes('pay')) status = 'paye';
    else if (statusRaw.includes('attent')) status = 'en-attente';
    else if (statusRaw.includes('remb')) status = 'rembourse';
    else if (statusRaw.includes('fail') || statusRaw.includes('ech') || statusRaw.includes('err')) status = 'echec';

    return {
      id: t?.id ?? t?._id ?? '',
      amount,
      status: status ?? (t?.status || undefined),
      paymentMethod: t?.paymentMethod || t?.method || undefined,
      createdAt,
      reservation: t?.reservation || undefined,
      description: t?.description || undefined,
      totalAmount: typeof t?.totalAmount === 'number' ? t.totalAmount : Number(t?.totalAmount || 0),
      paymentMode: t?.paymentMode || undefined,
    } as Transaction;
  };
}
