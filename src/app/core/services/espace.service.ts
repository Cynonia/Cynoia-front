import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, first, switchMap, map } from 'rxjs';
import { CreateEspaceDto, UpdateEspaceDto, Espace } from '../models/espace.model';
import { ApiService, ApiResponse } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  private readonly endpoint = '/espaces';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * List all spaces for the current user's entity. SSR-safe: returns empty list on server.
   */
  getAll(): Observable<ApiResponse<Espace[]>> {
    if (!this.isBrowser) {
      return of({ data: [], success: true } as ApiResponse<Espace[]>);
    }

    return this.auth.currentUser$.pipe(
      first(),
      switchMap(user => {
        const entityId = user?.entity?.id;
        if (!entityId) {
          return of({ data: [], success: true } as ApiResponse<Espace[]>);
        }
        return this.getAllByEntity(entityId);
      })
    );
  }

  /**
   * List spaces by entity id.
   */
  getAllByEntity(entityId: number): Observable<ApiResponse<Espace[]>> {
    return this.api.get<Espace[]>(`${this.endpoint}/entity/${entityId}`).pipe(
      map((resp: any) => Array.isArray(resp) ? ({ success: true, data: resp } as ApiResponse<Espace[]>) : resp)
    );
  }

  getById(id: number): Observable<ApiResponse<Espace>> {
    return this.api.get<Espace>(`${this.endpoint}/${id}`).pipe(
      map((resp: any) => (resp && resp.data !== undefined) ? resp : ({ success: true, data: resp } as ApiResponse<Espace>))
    );
  }

  create(data: CreateEspaceDto): Observable<ApiResponse<Espace>> {
    // OpenAPI expects `entityId`; map from potential `entitiesId` or current user if missing
    let entityId: number | undefined = (data as any).entityId ?? (data as any).entitiesId;
    if (!entityId && this.isBrowser) {
      entityId = this.auth.currentUser?.entity?.id;
    }
    const payload: any = { ...data, ...(entityId ? { entityId } : {}) };
    // Ensure we don't send deprecated key if present
    delete payload.entitiesId;
    return this.api.post<Espace>(this.endpoint, payload);
  }

  update(id: number, data: UpdateEspaceDto): Observable<ApiResponse<Espace>> {
    return this.api.put<Espace>(`${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
