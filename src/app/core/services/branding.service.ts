import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  primaryColor: string;
  hasCustomBranding: boolean;
}

export interface BrandingConfig {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  name: string;
  initials: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private currentOrganizationSubject = new BehaviorSubject<Organization | null>(null);
  public currentOrganization$ = this.currentOrganizationSubject.asObservable();

  // Branding par défaut de Cynoia
  private defaultBranding: BrandingConfig = {
    logo: 'assets/images/logo.svg',
    primaryColor: '#7C3AED', // Purple-600
    secondaryColor: '#A855F7', // Purple-500
    name: 'Cynoia',
    initials: 'CY'
  };

  constructor() {
    this.initializeOrganization();
  }

  private initializeOrganization(): void {
    // Simulation d'une organisation sans branding personnalisé
    const mockOrganization: Organization = {
      id: '1',
      name: 'Team 18',
      description: 'Propriétaire',
      primaryColor: this.defaultBranding.primaryColor,
      hasCustomBranding: false
    };

    this.currentOrganizationSubject.next(mockOrganization);
  }

  getCurrentBranding(): BrandingConfig {
    const organization = this.currentOrganizationSubject.value;
    
    if (!organization || !organization.hasCustomBranding) {
      // Utiliser le branding par défaut de Cynoia avec le nom de l'organisation
      return {
        ...this.defaultBranding,
        name: organization?.name || 'Team 18',
        initials: this.getInitials(organization?.name || 'Team 18')
      };
    }

    // Si l'organisation a un branding personnalisé
    return {
      logo: organization.logo || this.defaultBranding.logo,
      primaryColor: organization.primaryColor,
      secondaryColor: organization.primaryColor,
      name: organization.name,
      initials: this.getInitials(organization.name)
    };
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  updateOrganization(organization: Partial<Organization>): void {
    const current = this.currentOrganizationSubject.value;
    if (current) {
      this.currentOrganizationSubject.next({
        ...current,
        ...organization
      });
    }
  }

  get currentOrganization(): Organization | null {
    return this.currentOrganizationSubject.value;
  }

  // Méthodes utilitaires pour le CSS
  getCSSVariables(): string {
    const branding = this.getCurrentBranding();
    return `
      --primary-color: ${branding.primaryColor};
      --secondary-color: ${branding.secondaryColor};
    `;
  }
}