import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly endpoint = '/roles';
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor(private api: ApiService) {
    this.loadRoles();
  }

  // Charger tous les rôles
  loadRoles(): Observable<Role[]> {
    console.log('🔄 Chargement des rôles...');
    
    return this.api.get<Role[]>(this.endpoint).pipe(
      map(response => {
        const roles = response.data || [];
        console.log('✅ Rôles chargés:', roles);
        this.rolesSubject.next(roles);
        return roles;
      })
    );
  }

  // Obtenir tous les rôles
  getAllRoles(): Role[] {
    return this.rolesSubject.value;
  }

  // Obtenir un rôle par ID
  getRoleById(id: number): Role | undefined {
    return this.rolesSubject.value.find(role => role.id === id);
  }

  // Obtenir un rôle par nom
  getRoleByName(name: string): Role | undefined {
    return this.rolesSubject.value.find(role => 
      role.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Mapper un nom de rôle vers son ID
  getRoleIdByName(roleName: string): number | null {
    const role = this.getRoleByName(roleName);
    return role ? role.id : null;
  }

  // Obtenir les rôles disponibles pour les invitations
  getInvitableRoles(): Role[] {
    // Exclure les rôles sensibles si nécessaire
    return this.rolesSubject.value.filter(role => 
      !['super_admin', 'system'].includes(role.name.toLowerCase())
    );
  }

  // Créer un nouveau rôle (si nécessaire)
  createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Observable<Role> {
    return this.api.post<Role>(this.endpoint, roleData).pipe(
      map(response => {
        const newRole = response.data;
        const currentRoles = this.rolesSubject.value;
        this.rolesSubject.next([...currentRoles, newRole]);
        return newRole;
      })
    );
  }

  // Rafraîchir les rôles
  refreshRoles(): Observable<Role[]> {
    return this.loadRoles();
  }
}