import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEspaceDto, UpdateEspaceDto, Espace } from '../models/espace.model';
import { AuthService } from './auth.service'; // adjust path if different
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  private readonly baseUrl =
      environment.apiUrl + 'espaces' ||
      'http://localhost:3000/api/v1/espaces';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<Espace[]> {
    return this.http.get<Espace[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<Espace> {
    return this.http.get<Espace>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  create(data: CreateEspaceDto): Observable<Espace> {
    return this.http.post<Espace>(this.baseUrl, data, {
      headers: this.getAuthHeaders()
    });
  }

  update(id: number, data: UpdateEspaceDto): Observable<Espace> {
    return this.http.put<Espace>(`${this.baseUrl}/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
