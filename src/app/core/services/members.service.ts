import { Injectable } from '@angular/core';
import { BehaviorSubject, first } from 'rxjs';
import { ApiService } from './api.service';

export type MemberRole = 'proprietaire' | 'gestionnaire' | 'membre' | 'staff';
export type MemberStatus = 'actif' | 'inactif' | 'en-attente';

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActivity?: Date;
  avatar?: string;
  initials: string;
}

export interface MemberStats {
  total: number;
  proprietaires: number;
  gestionnaires: number;
  membres: number;
  staff: number;
  actifs: number;
  inactifs: number;
}

export interface MemberFilter {
  role?: MemberRole;
  status?: MemberStatus;
  search?: string;
}

export interface CreateMemberData {
  name: string;
  email: string;
  role: MemberRole;
}

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private readonly STORAGE_KEY = 'cynoia_members';
  
  private membersSubject = new BehaviorSubject<MemberProfile[]>([]);
  public members$ = this.membersSubject.asObservable();

  constructor(private api: ApiService) {
    this.refreshFromApi();
  }

  private refreshFromApi(): void {
    this.api.get<MemberProfile[]>('/members').pipe(first()).subscribe({
      next: (res) => {
        const members = (res.data || []).map((m: any) => ({
          ...m,
          joinedAt: new Date(m.joinedAt),
          lastActivity: m.lastActivity ? new Date(m.lastActivity) : undefined,
          initials: m.initials || this.generateInitials(m.name || '')
        }));
        this.membersSubject.next(members);
      },
      error: (err) => {
        console.warn('Unable to fetch members from API, falling back to sample data:', err);
        this.initializeWithSampleData();
      }
    });
  }

  private initializeWithSampleData(): void {
    const sampleMembers: MemberProfile[] = [
      {
        id: 'member-1',
        name: 'Jean Kouame',
        email: 'jean.kouame@example.com',
        role: 'proprietaire',
        status: 'actif',
        joinedAt: new Date('2024-01-15'),
        lastActivity: new Date('2024-12-15'),
        initials: 'JK'
      },
      {
        id: 'member-2',
        name: 'Marie Diallo',
        email: 'marie.diallo@example.com',
        role: 'membre',
        status: 'actif',
        joinedAt: new Date('2024-11-20'),
        lastActivity: new Date('2024-12-14'),
        initials: 'MD'
      },
      {
        id: 'member-3',
        name: 'Ahmed Kouassi',
        email: 'ahmed.kouassi@example.com',
        role: 'membre',
        status: 'actif',
        joinedAt: new Date('2024-12-01'),
        lastActivity: new Date('2024-12-13'),
        initials: 'AK'
      },
      {
        id: 'member-4',
        name: 'Fatou Ndiaye',
        email: 'fatou.ndiaye@example.com',
        role: 'gestionnaire',
        status: 'actif',
        joinedAt: new Date('2024-10-15'),
        lastActivity: new Date('2024-12-12'),
        initials: 'FN'
      },
      {
        id: 'member-5',
        name: 'Sekou Traore',
        email: 'sekou.traore@example.com',
        role: 'membre',
        status: 'en-attente',
        joinedAt: new Date('2024-12-10'),
        initials: 'ST'
      }
    ];

    this.saveMembers(sampleMembers);
  }

  private saveMembers(members: MemberProfile[]): void {
    // Local persistence removed; update in-memory subject only
    this.membersSubject.next(members);
  }

  // Obtenir tous les membres
  getAllMembers(): MemberProfile[] {
    return this.membersSubject.value;
  }

  // Obtenir un membre par ID
  getMemberById(id: string): MemberProfile | undefined {
    return this.membersSubject.value.find(member => member.id === id);
  }

  // Filtrer les membres
  getFilteredMembers(filter: MemberFilter): MemberProfile[] {
    let members = this.membersSubject.value;

    if (filter.role) {
      members = members.filter(m => m.role === filter.role);
    }

    if (filter.status) {
      members = members.filter(m => m.status === filter.status);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      members = members.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower)
      );
    }

    return members;
  }

  // Obtenir les membres par rôle
  getMembersByRole(role: MemberRole): MemberProfile[] {
    return this.membersSubject.value.filter(member => member.role === role);
  }

  // Obtenir les statistiques des membres
  getMemberStats(): MemberStats {
    const members = this.membersSubject.value;
    
    return {
      total: members.length,
      proprietaires: members.filter(m => m.role === 'proprietaire').length,
      gestionnaires: members.filter(m => m.role === 'gestionnaire').length,
      membres: members.filter(m => m.role === 'membre').length,
      staff: members.filter(m => m.role === 'staff').length,
      actifs: members.filter(m => m.status === 'actif').length,
      inactifs: members.filter(m => m.status === 'inactif').length
    };
  }

  // Créer un nouveau membre
  createMember(memberData: CreateMemberData): MemberProfile {
    throw new Error('Local createMember is deprecated. Use API endpoints to create members.');
  }

  // Mettre à jour un membre
  updateMember(id: string, updates: Partial<MemberProfile>): MemberProfile | null {
    throw new Error('Local updateMember is deprecated. Use API endpoints to update members.');
  }

  // Supprimer un membre
  deleteMember(id: string): boolean {
    throw new Error('Local deleteMember is deprecated. Use API endpoints to delete members.');
  }

  // Changer le rôle d'un membre
  changeRole(id: string, newRole: MemberRole): MemberProfile | null {
    return this.updateMember(id, { role: newRole });
  }

  // Changer le statut d'un membre
  changeStatus(id: string, newStatus: MemberStatus): MemberProfile | null {
    return this.updateMember(id, { status: newStatus });
  }

  // Envoyer une invitation (simulation)
  sendInvitation(memberData: CreateMemberData): Promise<MemberProfile> {
    return new Promise((resolve) => {
      // Simulation d'un appel API
      setTimeout(() => {
        const member = this.createMember(memberData);
        resolve(member);
      }, 1000);
    });
  }

  // Obtenir le libellé du rôle
  getRoleLabel(role: MemberRole): string {
    const labels: Record<MemberRole, string> = {
      'proprietaire': 'Propriétaire',
      'gestionnaire': 'Gestionnaire',
      'membre': 'Membre',
      'staff': 'Staff'
    };
    return labels[role];
  }

  // Obtenir le libellé du statut
  getStatusLabel(status: MemberStatus): string {
    const labels: Record<MemberStatus, string> = {
      'actif': 'Actif',
      'inactif': 'Inactif',
      'en-attente': 'En attente'
    };
    return labels[status];
  }

  // Formater la date de dernière activité
  formatLastActivity(date?: Date): string {
    if (!date) return 'Jamais connecté';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays}j`;
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
  }

  // Formater la date d'adhésion
  formatJoinDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Générer les initiales
  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Méthode pour vider tous les membres (utile pour les tests)
  clearAllMembers(): void {
    this.membersSubject.next([]);
  }
}