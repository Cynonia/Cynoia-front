import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { StoreService } from './store.service';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Normalize base url (ensure no trailing slash)
  private readonly baseUrl = (environment.apiUrl || 'http://localhost:3000/api/v1').replace(/\/$/, '');

  constructor(
    private http: HttpClient,
    private store: StoreService
  ) {}

  // Read token directly from storage to avoid direct dependency on AuthService and prevent circular DI
  private get token(): string | null {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
    } catch {
      return null;
    }
  }

  private getHeaders(): HttpHeaders {
  const token = this.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    const fullUrl = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.get<ApiResponse<T>>(fullUrl, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.post<ApiResponse<T>>(fullUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.put<ApiResponse<T>>(fullUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.delete<ApiResponse<T>>(fullUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const token = this.token;
    const headers = new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });

    const fullUrl = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.post<ApiResponse<T>>(fullUrl, formData, {
      headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  submitOnboarding() {
    const payload = this.store.prepareApiPayload();
    return this.post('/onboarding', payload).pipe(
      tap(response => this.store.handleApiSuccess(response))
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error
    }));
  }
}

