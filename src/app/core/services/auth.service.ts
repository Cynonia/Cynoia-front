import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { registerDto } from '../../../types/registerDto';

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
  private readonly API_URL = 'http://localhost:3000/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
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

  signIn(credentials: SignInCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => this.setAuthData(response)),
        catchError((error) => throwError(() => error))
      );
  }

  signUp(formValue: any): Observable<AuthResponse> {
    const userData: registerDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      login: formValue.login,
      email: formValue.email,
      password: formValue.password,
    };
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap((response) => this.setAuthData(response)),
        catchError((error) => throwError(() => error))
      );
  }

  signOut(): void {
    if (this.isBrowser) {
      this.http.post(`${this.API_URL}/signout`, {}).subscribe();
    }

    this.clearAuthData();
    if (this.isBrowser) {
      this.router.navigate(['/auth/signin']);
    }
  }

  refreshToken(): Observable<AuthResponse> {
    if (!this.isBrowser)
      return throwError(() => new Error('Not available on server'));

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.setAuthData(response, true)),
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
