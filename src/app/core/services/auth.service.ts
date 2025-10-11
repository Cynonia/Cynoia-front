import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { registerDto } from '../../../types/registerDto';
import { EntityRegisterDto } from '../../../types/entityRegisterDto';
import { environment } from '../../../environments/environment';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  role: string;
  entity: {
    id: number;
    name: string;
    logo: string;
    couleur: string;
    avatar: string;
    domaine: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_ENDPOINT = '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private api: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticated$.value;
  }

  signIn(credentials: SignInCredentials): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.api.post<{ user: User; token: string }>(`${this.AUTH_ENDPOINT}/login`, credentials).pipe(
      tap((response) => this.setAuthData({ success: response.success, message: response.message || '', data: response.data } as any)),
      catchError((error) => throwError(() => error))
    );
  }

  signUp(formValue: any): Observable<ApiResponse<{ user: User; token: string }>> {
    const userData: registerDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      login: formValue.login,
      email: formValue.email,
      password: formValue.password,
    };
    return this.api.post<{ user: User; token: string }>(`${this.AUTH_ENDPOINT}/register`, userData).pipe(
      tap((response) => this.setAuthData({ success: response.success, message: response.message || '', data: response.data } as any)),
      catchError((error) => throwError(() => error))
    );
  }

  // Register a client user into an entity using invitation token
  entityRegister(payload: EntityRegisterDto): Observable<ApiResponse<unknown>> {
    return this.api.post<unknown>(`${this.AUTH_ENDPOINT}/entity/register`, payload).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  signOut(): void {
    if (this.isBrowser) {
      this.api.post(`${this.AUTH_ENDPOINT}/signout`, {}).subscribe();
    }

    this.clearAuthData();
    if (this.isBrowser) {
      this.router.navigate(['/auth/login']);
    }
  }

  refreshToken(): Observable<ApiResponse<{ user: User; token: string }>> {
    if (!this.isBrowser)
      return throwError(() => new Error('Not available on server'));

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.post<{ user: User; token: string }>(`${this.AUTH_ENDPOINT}/refresh`, { refreshToken }).pipe(
      tap((response) => this.setAuthData({ success: response.success, message: response.message || '', data: response.data } as any, true)),
      catchError((error) => {
        this.signOut();
        return throwError(() => error);
      })
    );
  }

  private setAuthData(response: AuthResponse, remember = false): void {
    const { data } = response;

    this.currentUserSubject.next(data.user);
    this.tokenSubject.next(data.token);
    this.isAuthenticated$.next(true);

    if (!this.isBrowser) return; // Guard storage access

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('user', JSON.stringify(data.user));
    // if (remember && refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  private clearAuthData(): void {
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.isAuthenticated$.next(false);

    if (!this.isBrowser) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  private initializeAuth(): void {
    if (!this.isBrowser) return; // Do nothing on server

    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData =
      localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(token);
        this.isAuthenticated$.next(true);
      } catch {
        this.clearAuthData();
      }
    }
  }
}
