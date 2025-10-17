import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map, catchError, throwError, switchMap, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { InvitationService, InvitationRequest } from './invitation.service';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';

// Canonical roles per backend
export type MemberRole = 'admin' | 'manager' | 'member' | 'client';
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
  admins: number;
  managers: number;
  members: number;
  clients: number;
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
  roleId?: number;
  userId?: number;
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
    private rolesService: RolesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Do not auto-fetch members; only fetch when explicitly called from a component/page
    if (isPlatformBrowser(this.platformId)) {
      this.refreshMembersFromApi().subscribe();
    }
  }

  // Normalize API responses that may be wrapped or raw arrays
  private extractData<T>(resp: any): T {
    if (resp && Array.isArray(resp)) return resp as T;
    if (resp && typeof resp === 'object' && 'data' in resp) return resp.data as T;
    return resp as T;
  }

  // Map backend user object to MemberProfile used in UI
  private mapBackendUserToMemberProfile(u: any): MemberProfile {
    const id = (u?.id ?? u?._id ?? '').toString();
    const firstName = u?.firstName || '';
    const lastName = u?.lastName || '';
    const login = u?.login || '';
    const email = u?.email || '';
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || login || this.generateUsernameFromEmail(email);
    const createdAt = u?.createdAt ? new Date(u.createdAt) : new Date();
    const updatedAt = u?.updatedAt ? new Date(u.updatedAt) : undefined;
    const avatar = u?.avatar || undefined;
    
    // Extract role from u.role.code or u.role.name, fallback to u.role string
    const roleRaw: string = (u?.role?.code || u?.role?.name || u?.role || '').toString().toLowerCase();

    // Preserve backend canonical roles with legacy fallbacks mapping
    const roleMap: Record<string, MemberRole> = {
      admin: 'admin',
      manager: 'manager',
      client: 'client',
      member: 'member',
      user: 'member',
      // legacy fallbacks
      proprietaire: 'admin',
      owner: 'admin',
      gestionnaire: 'manager',
      membre: 'member',
      staff: 'client'
    };
    const role: MemberRole = roleMap[roleRaw] || 'member';

    return {
      id,
      name: displayName,
      email,
      role,
      status: 'actif',
      avatar: avatar || this.generateAvatar(displayName),
      joinedAt: createdAt,
      lastActivity: updatedAt,
      permissions: []
    };
  }

  // Fetch members from backend by current or provided entity id
  refreshMembersFromApi(entityId?: number): Observable<MemberProfile[]> {
    // During SSR, skip network and return empty list
    if (!isPlatformBrowser(this.platformId)) {
      this.membersSubject.next([]);
      return of([]);
    }
    const entityId$ = entityId ? of(entityId) : this.getCurrentEntityId();

    return entityId$.pipe(
      switchMap((id) => {
        if (!id) {
          console.warn('No entity id found; returning empty members list');
          return of([] as any[]);
        }
        return this.api.get<any[]>(`/users/entity/${id}`);
      }),
      map((resp) => this.extractData<any[]>(resp)),
      map((users) => (users || []).map((u) => this.mapBackendUserToMemberProfile(u))),
      tap((members) => this.membersSubject.next(members)),
      catchError((error) => {
        console.error('❌ Failed to load members from API:', error);
        this.membersSubject.next([]);
        return of([]);
      })
    );
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
      admins: members.filter(m => m.role === 'admin').length,
      managers: members.filter(m => m.role === 'manager').length,
      members: members.filter(m => m.role === 'member').length,
      clients: members.filter(m => m.role === 'client').length,
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

  // Optionally resolve role ids when needed elsewhere
  private getRoleIdByName(roleName: MemberRole): Observable<number> {
    return this.rolesService.roles$.pipe(
      map(roles => {
        const role = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        if (role) return role.id;
        const loose = roles.find(r => r.name.toLowerCase().includes(roleName.toLowerCase()));
        if (loose) return loose.id;
        const memberRole = roles.find(r => r.name.toLowerCase() === 'member');
        return memberRole ? memberRole.id : 0;
      })
    );
  }

  private getCurrentEntityId(): Observable<number> {
    if (this.authService && this.authService.currentUser$) {
      return this.authService.currentUser$.pipe(
        map(user => {
          // Expect current user to carry entity id from auth service
          if (user?.entity?.id) {
            return user.entity.id;
          }
          // Fallback if not available
          return 1;
        })
      );
    } else {
      return of(1);
    }
  }

  sendInvitation(memberData: CreateMemberData): Observable<any> {
    return this.getCurrentEntityId().pipe(
      switchMap((entityId) => {
        const invitationData: InvitationRequest = {
          email: memberData.email,
          entityId,
          roleId: memberData.roleId,
          userId: memberData.userId
        };

        return this.invitationService.sendInvitation(invitationData).pipe(
          map(response => {
            const tempMemberData: CreateMemberData = {
              ...memberData,
              name: memberData.name || this.generateUsernameFromEmail(memberData.email)
            };
            const member = this.createMember(tempMemberData);
            return { member, invitation: response.data };
          }),
          catchError(error => {
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
    // Expose Manager, Member, Client as invitable (exclude Admin)
    return this.rolesService.roles$.pipe(
      map(roles => roles
        .filter(r => ['manager', 'member', 'client'].includes(r.name.toLowerCase()))
        .map(r => ({
          value: r.name.toLowerCase() as MemberRole,
          label: this.getRoleLabel(r.name.toLowerCase() as MemberRole),
          id: r.id
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
      admin: 'Admin',
      manager: 'Manager',
      member: 'Membre',
      client: 'Client'
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