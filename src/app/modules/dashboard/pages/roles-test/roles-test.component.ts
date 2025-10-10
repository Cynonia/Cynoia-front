import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, Role } from '../../../../core/services/roles.service';
import { MembersService } from '../../../../core/services/members.service';

@Component({
  selector: 'app-roles-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6">Test des Rôles et Invitations</h2>
      
      <!-- Section test des rôles -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">🎭 Rôles récupérés depuis l'API</h3>
        
        <button 
          (click)="loadRoles()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700">
          Charger les rôles
        </button>
        
        <div *ngIf="roles.length > 0" class="space-y-2">
          <div *ngFor="let role of roles" class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <span class="font-medium">{{ role.name }}</span>
              <span class="text-gray-600 ml-2">(ID: {{ role.id }})</span>
            </div>
            <span class="text-sm text-gray-500">{{ role.description }}</span>
          </div>
        </div>
        
        <div *ngIf="rolesError" class="text-red-600 mt-2">
          ❌ Erreur: {{ rolesError }}
        </div>
      </div>

      <!-- Section test invitation -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">📧 Test d'invitation</h3>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <input 
            [(ngModel)]="testEmail" 
            placeholder="Email de test"
            class="px-3 py-2 border border-gray-300 rounded-lg">
          
          <select 
            [(ngModel)]="testRole" 
            class="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Sélectionner un rôle</option>
            <option *ngFor="let role of availableRoles" [value]="role.value">
              {{ role.label }} (ID: {{ role.id }})
            </option>
          </select>
        </div>
        
        <button 
          (click)="testInvitation()" 
          [disabled]="!testEmail || !testRole || isInviting"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
          {{ isInviting ? 'Envoi...' : 'Tester invitation' }}
        </button>
        
        <div *ngIf="invitationResult" class="mt-4 p-3 rounded-lg" 
             [class.bg-green-50]="invitationResult.success" 
             [class.bg-red-50]="!invitationResult.success">
          <h4 class="font-medium" [class.text-green-800]="invitationResult.success" 
                                 [class.text-red-800]="!invitationResult.success">
            {{ invitationResult.success ? '✅ Succès' : '❌ Erreur' }}
          </h4>
          <pre class="text-sm mt-2 whitespace-pre-wrap">{{ invitationResult.message }}</pre>
        </div>
      </div>

      <!-- Section logs -->
      <div>
        <h3 class="text-lg font-semibold mb-4">📝 Logs</h3>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto">
          <div *ngFor="let log of logs" class="mb-1">
            <span class="text-gray-500">{{ log.timestamp }}</span> {{ log.message }}
          </div>
        </div>
        <button 
          (click)="clearLogs()" 
          class="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          Effacer les logs
        </button>
      </div>
    </div>
  `
})
export class RolesTestComponent implements OnInit {
  roles: Role[] = [];
  availableRoles: any[] = [];
  rolesError: string = '';
  
  testEmail = 'mady@yopmail.com';
  testRole = '';
  isInviting = false;
  invitationResult: any = null;
  
  logs: { timestamp: string; message: string }[] = [];

  constructor(
    private rolesService: RolesService,
    private membersService: MembersService
  ) {}

  ngOnInit(): void {
    this.log('🚀 Composant de test initialisé');
    this.loadRoles();
  }

  loadRoles(): void {
    this.log('🔄 Chargement des rôles...');
    this.rolesError = '';
    
    this.rolesService.loadRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.log(`✅ ${roles.length} rôles chargés: ${roles.map(r => r.name).join(', ')}`);
        this.loadAvailableRoles();
      },
      error: (error) => {
        this.rolesError = error.message || 'Erreur lors du chargement des rôles';
        this.log(`❌ Erreur rôles: ${this.rolesError}`);
        console.error('Erreur rôles:', error);
      }
    });
  }

  loadAvailableRoles(): void {
    this.membersService.getAvailableRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.log(`🎯 ${roles.length} rôles disponibles pour invitation`);
        
        // Pré-sélectionner "membre" si disponible
        const membreRole = roles.find(r => r.value === 'membre');
        if (membreRole) {
          this.testRole = membreRole.value;
          this.log(`🎯 Rôle "membre" pré-sélectionné`);
        }
      },
      error: (error) => {
        this.log(`❌ Erreur rôles disponibles: ${error.message}`);
      }
    });
  }

  testInvitation(): void {
    if (!this.testEmail || !this.testRole) {
      this.log('❌ Email et rôle requis pour le test');
      return;
    }

    this.log(`📧 Test invitation: ${this.testEmail} avec rôle ${this.testRole}`);
    this.isInviting = true;
    this.invitationResult = null;

    const memberData = {
      email: this.testEmail,
      role: this.testRole as any
    };

    this.membersService.sendInvitation(memberData).subscribe({
      next: (result) => {
        this.invitationResult = {
          success: true,
          message: JSON.stringify(result, null, 2)
        };
        this.log(`✅ Invitation envoyée avec succès à ${this.testEmail}`);
      },
      error: (error) => {
        this.invitationResult = {
          success: false,
          message: JSON.stringify({
            error: error.message,
            details: error.error || error
          }, null, 2)
        };
        this.log(`❌ Erreur invitation: ${error.message}`);
      },
      complete: () => {
        this.isInviting = false;
      }
    });
  }

  log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, message });
    console.log(`[${timestamp}] ${message}`);
    
    // Limiter à 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
  }

  clearLogs(): void {
    this.logs = [];
    this.log('🧹 Logs effacés');
  }
}