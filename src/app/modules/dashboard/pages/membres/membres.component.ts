import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembersService, MemberProfile, MemberRole, MemberStats, MemberFilter, CreateMemberData } from '../../../../core/services/members.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../core/services/modal.service';
import { InvitationService } from '../../../../core/services/invitation.service';
import { RolesService, Role } from '../../../../core/services/roles.service';

@Component({
  selector: 'app-membres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <button class="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="min-w-0">
            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Gestion des membres</h1>
            <p class="text-xs sm:text-sm text-gray-600 truncate">Invitez et gérez les membres de votre organisation</p>
          </div>
        </div>
        
          <div class="flex items-center gap-2 flex-shrink-0">
          <button 
            (click)="openInviteModal()"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm whitespace-nowrap">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span class="hidden sm:inline">Inviter un membre</span>
            <span class="sm:hidden">Inviter</span>
          </button>

          <!-- Bouton de test -->
          <button 
            (click)="openInviteModalTest()"
            class="inline-flex items-center gap-1.5 sm:gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span class="hidden sm:inline">Test Invitation</span>
            <span class="sm:hidden">Test</span>
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-lg sm:text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              <p class="text-xs sm:text-sm text-gray-600 truncate">Total membres</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-lg sm:text-2xl font-bold text-gray-900">{{ stats.admins }}</p>
              <p class="text-xs sm:text-sm text-gray-600 truncate">Administrateurs</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-lg sm:text-2xl font-bold text-gray-900">{{ stats.managers }}</p>
              <p class="text-xs sm:text-sm text-gray-600 truncate">Gestionnaires</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <div class="min-w-0">
              <p class="text-lg sm:text-2xl font-bold text-gray-900">{{ stats.actifs }}</p>
              <p class="text-xs sm:text-sm text-gray-600 truncate">Actifs</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre de recherche et filtres -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div class="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <!-- Barre de recherche -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
                placeholder="Rechercher un membre..."
                class="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Filtres par rôle -->
        <div class="mb-4 sm:mb-6">
          <p class="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Filtrer par rôle :</p>
          <div class="flex flex-wrap gap-2">
            <button 
              *ngFor="let role of roleFilters"
              (click)="setRoleFilter(role.key)"
              [class]="getRoleFilterClass(role.key)"
              class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap">
              {{ role.label }}
              <span *ngIf="role.count > 0" class="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                {{ role.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Liste des membres -->
        <div class="space-y-2 sm:space-y-3">
          <div *ngFor="let member of filteredMembers" 
               class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <!-- Info membre -->
            <div class="flex items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
              <!-- Avatar -->
              <div [class]="getAvatarClass(member)" 
                   class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-xs sm:text-sm font-semibold">{{ getInitials(member.name) }}</span>
              </div>
              
              <!-- Détails -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm sm:text-base font-semibold text-gray-900 truncate">{{ member.name }}</h3>
                  <span *ngIf="member.status === 'en-attente'" 
                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap flex-shrink-0">
                    En attente
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-gray-500 truncate">{{ member.email }}</p>
                <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs text-gray-500 mt-1">
                  <span class="truncate">Rejoint le {{ formatJoinDate(member.joinedAt) }}</span>
                  <span class="hidden sm:inline">•</span>
                  <span class="truncate">Activité : {{ formatLastActivity(member.lastActivity) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
              <!-- Badge de rôle -->
              <span [class]="getRoleBadgeClass(member.role)" 
                    class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {{ getRoleLabel(member.role) }}
              </span>

              <!-- Menu d'actions -->
              <div class="relative">
                <button 
                  (click)="toggleMemberMenu(member.id)"
                  class="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex-shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
                
                <!-- Menu déroulant -->
                <div *ngIf="activeMemberMenu === member.id" 
                     class="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button 
                    (click)="editMember(member)"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Modifier
                  </button>
                  <button 
                    (click)="deleteMember(member)"
                    class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'invitation -->
      <div *ngIf="showInviteModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
           (click)="closeInviteModal()">
        <div class="bg-white rounded-lg p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Inviter un nouveau membre</h2>
            <button 
              (click)="closeInviteModal()"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmitInvite()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse email *</label>
              <input 
                type="email" 
                [(ngModel)]="inviteForm.email"
                name="email"
                required
                placeholder="marie@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>

            <!-- Rôle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select 
                [ngModel]="inviteForm.roleId"
                (ngModelChange)="onRoleChange($event)"
                name="roleId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option *ngFor="let role of availableRoles" [ngValue]="role.id">
                  {{ role.name }}
                </option>
                <!-- Fallback options si les rôles ne sont pas encore chargés -->
                <option *ngIf="availableRoles.length === 0" [ngValue]="3">Membre</option>
                <option *ngIf="availableRoles.length === 0" value="2">Gestionnaire</option>
                <option *ngIf="availableRoles.length === 0" value="4">Client</option>
              </select>
            </div>

            <!-- Message d'info -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex gap-3">
                <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm text-blue-800">
                  Un email d'invitation sera envoyé à cette adresse. L'utilisateur pourra compléter son profil lors de l'acceptation de l'invitation.
                </p>
              </div>
            </div>

            <!-- Boutons -->
            <div class="flex gap-3 pt-4">
              <button 
                type="button"
                (click)="closeInviteModal()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button 
                type="submit"
                [disabled]="isInviting"
                class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                {{ isInviting ? 'Envoi...' : "Envoyer l'invitation" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class MembresComponent implements OnInit {
  onRoleChange(roleId: number) {
    const selectedRole = this.availableRoles.find(r => r.id === roleId);
    this.inviteForm.roleId = roleId;
  }
  members: MemberProfile[] = [];
  filteredMembers: MemberProfile[] = [];
  stats: MemberStats = {
    total: 0,
    admins: 0,
    managers: 0,
    members: 0,
    clients: 0,
    actifs: 0,
    inactifs: 0,
    enAttente: 0
  };

  // Filtres et recherche
  searchTerm = '';
  activeRoleFilter: string | null = null;
  activeMemberMenu: string | null = null;

  // Modal d'invitation
  showInviteModal = false;
  isInviting = false;
  inviteForm: CreateMemberData = {
  email: '',
  role: 'member',
  roleId: undefined
  };

  // Rôles dynamiques
  availableRoles: Role[] = [];

  // Filtres par rôle
  roleFilters = [
    { key: null, label: 'Tous', count: 0 },
    { key: 'admin', label: 'Administrateurs', count: 0 },
    { key: 'manager', label: 'Gestionnaires', count: 0 },
    { key: 'member', label: 'Membres', count: 0 },
    { key: 'client', label: 'Clients', count: 0 }
  ];

  constructor(
  private membersService: MembersService, 
  private modal: ModalService,
  private invitationService: InvitationService,
  private rolesService: RolesService,
  private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Always fetch members from backend when accessing the page
    this.membersService.refreshMembersFromApi().subscribe(() => {
      this.loadMembers();
      this.subscribeToMembers();
      this.loadRoles();
    });
  }

  private loadRoles(): void {
    this.rolesService.roles$.subscribe(roles => {
      this.availableRoles = this.rolesService.getInvitableRoles();
      console.log('🎭 Rôles disponibles pour invitation:', this.availableRoles);
    });
    
    // Charger les rôles si pas encore chargés
    if (this.rolesService.getAllRoles().length === 0) {
      this.rolesService.loadRoles().subscribe();
    }
  }

  private subscribeToMembers(): void {
    this.membersService.members$.subscribe(members => {
      this.members = members;
      this.updateStats();
      this.updateRoleFilterCounts();
      this.applyFilters();
    });
  }

  private loadMembers(): void {
    this.members = this.membersService.getAllMembers();
    this.updateStats();
    this.updateRoleFilterCounts();
    this.applyFilters();
  }

  private updateStats(): void {
    this.stats = this.membersService.getMemberStats();
  }

  private updateRoleFilterCounts(): void {
    this.roleFilters[0].count = this.stats.total; // Tous
    this.roleFilters[1].count = this.stats.admins; // Administrateurs
    this.roleFilters[2].count = this.stats.managers; // Gestionnaires
    this.roleFilters[3].count = this.stats.members; // Membres
    this.roleFilters[4].count = this.stats.clients; // Clients
  }

  private applyFilters(): void {
    const filter: MemberFilter = {
      search: this.searchTerm || undefined,
      role: this.activeRoleFilter as MemberRole || undefined
    };

    this.filteredMembers = this.membersService.getFilteredMembers(filter);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setRoleFilter(role: string | null): void {
    this.activeRoleFilter = role;
    this.applyFilters();
  }

  getRoleFilterClass(roleKey: string | null): string {
    const baseClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    if (roleKey === this.activeRoleFilter) {
      return `${baseClass} bg-purple-600 text-white`;
    }
    return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }

  getAvatarClass(member: MemberProfile): string {
    const baseClass = 'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0';
    
    switch (member.role) {
      case 'admin':
        return `${baseClass} bg-purple-600`;
      case 'manager':
        return `${baseClass} bg-blue-600`;
      case 'client':
        return `${baseClass} bg-green-600`;
      default:
        return `${baseClass} bg-gray-500`;
    }
  }

  getRoleBadgeClass(role: MemberRole): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium';
    
    switch (role) {
      case 'admin':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'manager':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'client':
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getRoleLabel(role: MemberRole): string {
    return this.membersService.getRoleLabel(role);
  }

  formatJoinDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }

  formatLastActivity(date?: Date): string {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days} jour(s)`;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  toggleMemberMenu(memberId: string): void {
    this.activeMemberMenu = this.activeMemberMenu === memberId ? null : memberId;
  }

  editMember(member: MemberProfile): void {
    console.log('Éditer membre:', member);
    this.activeMemberMenu = null;
  }

  async deleteMember(member: MemberProfile): Promise<void> {
    const ok = await this.modal.confirm({
      title: 'Supprimer le membre',
      message: `Êtes-vous sûr de vouloir supprimer ${member.name} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });
    if (ok) {
      this.membersService.deleteMember(member.id);
    }
    this.activeMemberMenu = null;
  }

  // Mise à jour de la validation dans onSubmitInvite

  async onSubmitInvite(): Promise<void> {
    if (!this.inviteForm.email) { // ✅ Plus besoin de vérifier le name
      console.error('Email requis');
      return;
    }

    this.isInviting = true;
    
    try {
      // Set userId to connected user's id
      const connectedUserId = this.authService?.currentUser?.id;
      if (connectedUserId) {
        this.inviteForm.userId = connectedUserId;
      }
      this.membersService.sendInvitation(this.inviteForm).subscribe({
        next: (result) => {
          console.log('✅ Invitation envoyée avec succès:', result);
          this.closeInviteModal();
          console.log(`✉️ Invitation envoyée à ${this.inviteForm.email}`);
          this.loadMembers();
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'envoi de l\'invitation:', error);
          const errorMessage = error?.error?.message || 'Erreur lors de l\'envoi de l\'invitation';
          console.error('📝 Message d\'erreur:', errorMessage);
        },
        complete: () => {
          this.isInviting = false;
        }
      });
    } catch (error) {
      console.error('🚨 Erreur inattendue:', error);
      this.isInviting = false;
    }
  }

  // Mise à jour des méthodes d'ouverture du modal
  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteForm = {
      email: '',
      role: 'member'
    };
    this.isInviting = false;
  }

  openInviteModal(): void {
    this.showInviteModal = true;
    this.inviteForm = {
      email: '',
      role: 'member'
    };
  }

  openInviteModalTest(): void {
    this.showInviteModal = true;
    this.inviteForm = {
      email: 'mady@yopmail.com', 
      role: 'member'
    };
  }

  // Obtenir le libellé d'un rôle dynamiquement
  getRoleDisplayName(roleName: string): string {
    const role = this.availableRoles.find(r => 
      r.name.toLowerCase() === roleName.toLowerCase()
    );
    return role ? role.name : roleName;
  }
}