import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, throwError, switchMap, of, forkJoin, combineLatest } from 'rxjs';
import { ApiService } from './api.service';
import { InvitationService, InvitationRequest } from './invitation.service';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';

export type MemberRole = 'proprietaire' | 'gestionnaire' | 'membre' | 'staff';
export type MemberStatus = 'actif' | 'inactif' | 'en-attente';

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  avatar?: string;
  joinedAt: Date;
  lastActivity?: Date;
  permissions?: string[];
}

export interface MemberStats {
  total: number;
  actifs: number;
  inactifs: number;
  enAttente: number;
  proprietaires: number;
  gestionnaires: number;
  membres: number;
  staff: number;
}

export interface MemberFilter {
  role?: MemberRole;
  status?: MemberStatus;
  search?: string;
}

export interface CreateMemberData {
  name?: string;
  email: string;
  role: MemberRole;
}

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private membersSubject = new BehaviorSubject<MemberProfile[]>([]);
  public members$ = this.membersSubject.asObservable();

  constructor(
    private api: ApiService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private rolesService: RolesService
  ) {
    this.loadMembers();
  }

  private loadMembers(): void {
    const initialMembers: MemberProfile[] = [
      {
        id: '1',
        name: 'Marie Kouassi',
        email: 'marie@cynoia.com',
        role: 'proprietaire',
        status: 'actif',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612d5c7',
        joinedAt: new Date('2024-01-15'),
        lastActivity: new Date(),
        permissions: ['all']
      },
      {
        id: '2', 
        name: 'Jean Diallo',
        email: 'jean@cynoia.com',
        role: 'gestionnaire',
        status: 'actif',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        joinedAt: new Date('2024-02-01'),
        lastActivity: new Date(Date.now() - 1000 * 60 * 30),
        permissions: ['manage_spaces', 'manage_reservations']
      },
      {
        id: '3',
        name: 'Aminata Traoré',
        email: 'aminata@example.com',
        role: 'membre',
        status: 'actif',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        joinedAt: new Date('2024-02-10'),
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
        permissions: ['view_spaces', 'make_reservations']
      }
    ];

    this.membersSubject.next(initialMembers);
  }

  getAllMembers(): MemberProfile[] {
    return this.membersSubject.value;
  }

  getMemberById(id: string): MemberProfile | undefined {
    return this.membersSubject.value.find(member => member.id === id);
  }

  getFilteredMembers(filter: MemberFilter): MemberProfile[] {
    let members = this.membersSubject.value;

    if (filter.role) {
      members = members.filter(member => member.role === filter.role);
    }

    if (filter.status) {
      members = members.filter(member => member.status === filter.status);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      members = members.filter(member => 
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search)
      );
    }

    return members;
  }

  getMemberStats(): MemberStats {
    const members = this.membersSubject.value;
    return {
      total: members.length,
      actifs: members.filter(m => m.status === 'actif').length,
      inactifs: members.filter(m => m.status === 'inactif').length,
      enAttente: members.filter(m => m.status === 'en-attente').length,
      proprietaires: members.filter(m => m.role === 'proprietaire').length,
      gestionnaires: members.filter(m => m.role === 'gestionnaire').length,
      membres: members.filter(m => m.role === 'membre').length,
      staff: members.filter(m => m.role === 'staff').length,
    };
  }

  createMember(memberData: CreateMemberData): MemberProfile {
    const displayName = memberData.name || this.generateUsernameFromEmail(memberData.email);
    const newMember: MemberProfile = {
      id: Date.now().toString(),
      name: displayName,
      email: memberData.email,
      role: memberData.role,
      status: 'en-attente',
      joinedAt: new Date(),
      avatar: this.generateAvatar(displayName)
    };

    const currentMembers = this.membersSubject.value;
    this.membersSubject.next([...currentMembers, newMember]);

    return newMember;
  }

  // ✅ Obtenir le roleId depuis le service des rôles
  private getRoleIdByName(roleName: MemberRole): Observable<number> {
    return this.rolesService.roles$.pipe(
      map(roles => {
        const role = roles.find(r => 
          r.name.toLowerCase() === roleName.toLowerCase() ||
          r.name === roleName
        );
        
        if (role) {
          console.log(`🔍 Rôle trouvé: "${roleName}" → ID: ${role.id}`);
          return role.id;
        }
        
        // Fallback avec mapping par défaut si le rôle n'est pas trouvé
        const defaultMapping: Record<MemberRole, number> = {
          'proprietaire': 1,
          'gestionnaire': 2,
          'membre': 3,
          'staff': 4
        };
        
        console.log(`⚠️ Rôle "${roleName}" non trouvé dans l'API, utilisation du mapping par défaut: ${defaultMapping[roleName]}`);
        return defaultMapping[roleName] || 3; // Défaut: membre
      })
    );
  }

  private getCurrentEntityId(): Observable<number> {
    if (this.authService && this.authService.currentUser$) {
      return this.authService.currentUser$.pipe(
        map(user => {
          console.log('👤 Utilisateur actuel:', user);
          
          if (user?.entity?.id) {
            console.log('🏢 Entité trouvée:', user.entity.id);
            return user.entity.id;
          }
          
          console.log('⚠️ Aucune entité trouvée, utilisation de l\'ID par défaut');
          return 1;
        })
      );
    } else {
      console.log('⚠️ AuthService non disponible, utilisation de l\'ID par défaut');
      return of(1);
    }
  }

  sendInvitation(memberData: CreateMemberData): Observable<any> {
    return combineLatest([
      this.getCurrentEntityId(),
      this.getRoleIdByName(memberData.role)
    ]).pipe(
      switchMap(([entityId, roleId]) => {
        // ✅ Nouvelle structure conforme au backend
        const invitationData: InvitationRequest = {
          email: memberData.email,
          entityId: entityId,
          roleId: roleId // ✅ Utilisation du roleId dynamique
          // ❌ Supprimé le champ 'name'
        };

        console.log('📧 Données invitation complètes:', invitationData);
        
        return this.invitationService.sendInvitation(invitationData).pipe(
          map(response => {
            // ✅ Créer un membre local avec un username temporaire basé sur l'email
            const tempMemberData: CreateMemberData = {
              ...memberData,
              name: memberData.name || this.generateUsernameFromEmail(memberData.email)
            };
            const member = this.createMember(tempMemberData);
            console.log('✅ Invitation envoyée avec succès:', response);
            return { member, invitation: response.data };
          }),
          catchError(error => {
            console.error('❌ Erreur lors de l\'envoi de l\'invitation:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  // ✅ Génération d'un nom d'utilisateur temporaire basé sur l'email
  private generateUsernameFromEmail(email: string): string {
    const emailPart = email.split('@')[0];
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
  }

  // ✅ Obtenir les rôles disponibles pour les invitations
  getAvailableRoles(): Observable<any[]> {
    return this.rolesService.roles$.pipe(
      map(roles => 
        roles
          .filter(role => ['membre', 'gestionnaire', 'staff'].includes(role.name.toLowerCase()))
          .map(role => ({
            value: role.name.toLowerCase() as MemberRole,
            label: this.getRoleLabel(role.name.toLowerCase() as MemberRole),
            id: role.id
          }))
      )
    );
  }

  updateMember(id: string, updates: Partial<MemberProfile>): MemberProfile | null {
    const currentMembers = this.membersSubject.value;
    const memberIndex = currentMembers.findIndex(member => member.id === id);
    
    if (memberIndex === -1) return null;

    const updatedMember = { ...currentMembers[memberIndex], ...updates };
    currentMembers[memberIndex] = updatedMember;
    this.membersSubject.next([...currentMembers]);

    return updatedMember;
  }

  deleteMember(id: string): boolean {
    const currentMembers = this.membersSubject.value;
    const filteredMembers = currentMembers.filter(member => member.id !== id);
    
    if (filteredMembers.length === currentMembers.length) return false;

    this.membersSubject.next(filteredMembers);
    return true;
  }

  changeRole(id: string, newRole: MemberRole): MemberProfile | null {
    return this.updateMember(id, { role: newRole });
  }

  changeStatus(id: string, newStatus: MemberStatus): MemberProfile | null {
    return this.updateMember(id, { status: newStatus });
  }

  getRoleLabel(role: MemberRole): string {
    const labels: Record<MemberRole, string> = {
      'proprietaire': 'Propriétaire',
      'gestionnaire': 'Gestionnaire', 
      'membre': 'Membre',
      'staff': 'Staff'
    };
    return labels[role];
  }

  getStatusLabel(status: MemberStatus): string {
    const labels: Record<MemberStatus, string> = {
      'actif': 'Actif',
      'inactif': 'Inactif',
      'en-attente': 'En attente'
    };
    return labels[status];
  }

  private generateAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=128`;
  }
}