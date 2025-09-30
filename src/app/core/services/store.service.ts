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
    // Initialiser l'état depuis le localStorage (guard for SSR)
    try {
      const savedState = this.safeLocalGet(this.STORAGE_KEY);
      if (savedState) {
        this.state.next(JSON.parse(savedState));
      }
    } catch (err) {
      // In SSR there is no localStorage; keep in-memory state empty
      // console.debug('StoreService: localStorage not available in this environment');
    }
  }

  saveSignupData(userData: any) {
    const currentState = this.state.value;
    const newState = {
      ...currentState,
      user: userData,
      onboardingStep: 'organization'
    };

    // Sauvegarder dans le localStorage (if available)
    this.safeLocalSet(this.STORAGE_KEY, JSON.stringify(newState));
    this.state.next(newState);
  }

  saveOrganizationData(orgData: any) {
    const currentState = this.state.value;
    const newState = {
      ...currentState,
      organization: orgData,
      onboardingStep: 'branding-logo'
    };

    // Sauvegarder dans le localStorage (if available)
    this.safeLocalSet(this.STORAGE_KEY, JSON.stringify(newState));
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
    this.safeLocalSet(this.STORAGE_KEY, JSON.stringify(newState));
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
    this.safeLocalSet(this.STORAGE_KEY, JSON.stringify(newState));
    this.state.next(newState);
  }

  getState() {
    return this.state.asObservable();
  }

  getCurrentState() {
    return this.state.value;
  }

  handleApiSuccess(respinse: any){
    console.log("api success");
    
  }

  prepareApiPayload(){
    return  {}
  }

  // Pending reservation helpers (temporary storage across payment flow)
  savePendingReservation(reservation: any, persist = false) {
    try {
      if (persist) this.safeSessionSet('pendingReservation', JSON.stringify(reservation));
      this.state.next({ ...this.state.value, pendingReservation: reservation });
    } catch (err) {
      console.error('Failed to save pending reservation', err);
    }
  }

  getPendingReservation(): any | null {
    try {
      const fromState = this.state.value?.pendingReservation;
      if (fromState) return fromState;
      const fromSession = this.safeSessionGet('pendingReservation');
      return fromSession ? JSON.parse(fromSession) : null;
    } catch (err) {
      console.error('Failed to read pending reservation', err);
      return null;
    }
  }

  clearPendingReservation() {
    try {
      this.state.next({ ...this.state.value, pendingReservation: undefined });
      this.safeSessionRemove('pendingReservation');
    } catch (err) {
      console.error('Failed to clear pending reservation', err);
    }
  }

  // Safe storage helpers (guards for SSR)
  private safeLocalGet(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      // ignore
    }
    return null;
  }

  private safeLocalSet(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      // ignore
    }
  }

  private safeSessionGet(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (err) {
      // ignore
    }
    return null;
  }

  private safeSessionSet(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (err) {
      // ignore
    }
  }

  private safeSessionRemove(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (err) {
      // ignore
    }
  }

  // ... autres méthodes du service ...
}