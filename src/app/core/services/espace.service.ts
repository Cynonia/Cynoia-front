import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateEspaceDto, UpdateEspaceDto, Espace } from '../models/espace.model';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  private readonly endpoint = '/espaces';

  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<Espace[]>> {
    return this.api.get<Espace[]>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<Espace>> {
    return this.api.get<Espace>(`${this.endpoint}/${id}`);
  }

  create(data: CreateEspaceDto): Observable<ApiResponse<Espace>> {
    return this.api.post<Espace>(this.endpoint, data);
  }

  update(id: number, data: UpdateEspaceDto): Observable<ApiResponse<Espace>> {
    return this.api.put<Espace>(`${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
