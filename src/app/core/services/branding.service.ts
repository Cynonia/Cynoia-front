import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService, User } from './auth.service'; // 👈 Assure-toi que le chemin est correct

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

  private currentUser: User | null = null;

  // Branding par défaut de Cynoia
  private defaultBranding: BrandingConfig = {
    logo: 'assets/images/logo.svg',
    primaryColor: '#7C3AED',
    secondaryColor: '#A855F7',
    name: 'Cynoia',
    initials: 'CY'
  };

  constructor(private authService: AuthService) {
    // 🔁 S'abonner à l'utilisateur connecté
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.initializeOrganization(); // 🔁 Réinitialise le branding si l'utilisateur change
    });
  }

  private initializeOrganization(): void {
    const mockOrganization: Organization = {
      id: '1',
      name: this.currentUser?.entity.name || 'Team 18', // 👈 Utilisation du nom de l'utilisateur connecté
      description: 'Propriétaire',
      primaryColor: this.currentUser?.entity.couleur ?? this.defaultBranding.primaryColor,
      logo: this.currentUser?.entity.logo ?? "",
      hasCustomBranding: false,
    };

    this.currentOrganizationSubject.next(mockOrganization);
  }

  getCurrentBranding(): BrandingConfig {
    const organization = this.currentOrganizationSubject.value;

    if (!organization || !organization.hasCustomBranding) {
      return {
        ...this.defaultBranding,
        name: organization?.name || 'Team 18',
        initials: this.getInitials(organization?.name || 'Team 18')
      };
    }

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

  getCSSVariables(): string {
    const branding = this.getCurrentBranding();
    return `
      --primary-color: ${branding.primaryColor};
      --secondary-color: ${branding.secondaryColor};
    `;
  }
}
