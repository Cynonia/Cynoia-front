import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface InvitationRequest {
  email: string;
  entityId: number;
  roleId: number; // ✅ Changé de 'role' à 'roleId'
  // ❌ Supprimé le champ 'name'
}

export interface InvitationResponse {
  id: string;
  email: string;
  name?: string;
  role: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  entityId: number;
  createdAt: string;
  expiresAt: string;
}

export interface InvitationDetails {
  id: string;
  email: string;
  name?: string;
  role: string;
  token: string;
  status: string;
  entity: {
    id: number;
    name: string;
    logo?: string;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly endpoint = '/invitations';

  constructor(private api: ApiService) {}

  // Envoyer une invitation
  sendInvitation(data: InvitationRequest): Observable<ApiResponse<InvitationResponse>> {
    console.log('🚀 Envoi invitation:', data);
    
    return this.api.post<InvitationResponse>(this.endpoint, data).pipe(
      tap(response => console.log('✅ Réponse invitation:', response)),
      catchError(error => {
        console.error('❌ Erreur invitation:', error);
        return throwError(() => error);
      })
    );
  }

  // Accepter une invitation
  acceptInvitation(token: string, userData?: any): Observable<ApiResponse<any>> {
    return this.api.post<any>(`${this.endpoint}/accept`, { token, ...userData });
  }

  // Rejeter une invitation
  rejectInvitation(token: string, reason?: string): Observable<ApiResponse<any>> {
    return this.api.post<any>(`${this.endpoint}/reject`, { token, reason });
  }

  // Détails d'une invitation par token
  getInvitationByToken(token: string): Observable<ApiResponse<InvitationDetails>> {
    return this.api.get<InvitationDetails>(`${this.endpoint}/${token}`);
  }

  // Lister les invitations d'une entité
  getEntityInvitations(entityId: number): Observable<ApiResponse<InvitationResponse[]>> {
    return this.api.get<InvitationResponse[]>(`${this.endpoint}/entity/${entityId}`);
  }

  // Annuler une invitation
  cancelInvitation(invitationId: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${invitationId}`);
  }
}