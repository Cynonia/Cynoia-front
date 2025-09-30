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
      this.applyCssVariables();
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

  

  // Compute whether white or black foreground is more readable on the primary color
  private getContrastingForeground(hexColor: string): string {
    // Normalize hex
    const c = hexColor.replace('#', '');
    const bigint = parseInt(c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Relative luminance
    const [rs, gs, bs] = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;

    // WCAG contrast threshold ~0.179 — pick white for dark backgrounds
    return luminance > 0.179 ? '#111827' : '#ffffff';
  }

  applyCssVariables(): void {
    if (typeof document === 'undefined') return;
    const branding = this.getCurrentBranding();
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor || this.defaultBranding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor || branding.primaryColor || this.defaultBranding.secondaryColor);
    const fg = this.getContrastingForeground(branding.primaryColor || this.defaultBranding.primaryColor);
    root.style.setProperty('--primary-foreground', fg);
  }
}
