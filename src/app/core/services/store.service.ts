import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  token?: string;
}

export interface OrganizationData {
  name: string;
  workspace: string;
  website?: string;
  spaceEmail?: string;
  spacePhone?: string;
  branding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export interface AppState {
  user: UserData | null;
  organization: OrganizationData | null;
  isAuthenticated: boolean;
  onboardingStep: 'signup' | 'organization' | 'branding-logo' | 'branding-colors' | 'branding-preview' | 'complete' | null;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly STORAGE_KEY = 'app_state';
  private state = new BehaviorSubject<any>({});

  constructor() {
    // Initialiser l'état depuis le localStorage
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState) {
      this.state.next(JSON.parse(savedState));
    }
  }

  saveSignupData(userData: any) {
    const currentState = this.state.value;
    const newState = {
      ...currentState,
      user: userData,
      onboardingStep: 'organization'
    };

    // Sauvegarder dans le localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    this.state.next(newState);
  }

  saveOrganizationData(orgData: any) {
    const currentState = this.state.value;
    const newState = {
      ...currentState,
      organization: orgData,
      onboardingStep: 'branding-logo'
    };

    // Sauvegarder dans le localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    this.state.next(newState);
  }

  saveBrandingLogo(logo: string) {
    const currentState = this.state.value;
    const newState = {
      ...currentState,
      organization: {
        ...currentState.organization,
        branding: { ...currentState.organization?.branding, logo }
      },
      onboardingStep: 'branding-colors'
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    this.state.next(newState);
  }

  saveBrandingColors(colors: { primary: string; secondary: string; accent: string; }) {
    const currentState = this.state.value;
    const newState = {
      ...currentState,
      organization: {
        ...currentState.organization,
        branding: { ...currentState.organization?.branding, colors }
      },
      onboardingStep: 'branding-preview'
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
    this.state.next(newState);
  }

  getState() {
    return this.state.asObservable();
  }

  getCurrentState() {
    return this.state.value;
  }

  // ... autres méthodes du service ...
}