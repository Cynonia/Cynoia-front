import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, first, switchMap, map } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CreateEspaceDto, UpdateEspaceDto, Espace } from '../models/espace.model';
import { ApiService, ApiResponse } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  private readonly endpoint = '/espaces';
  // Simple in-memory caches to dedupe identical requests
  private allByEntityCache = new Map<number, Observable<ApiResponse<Espace[]>>>();
  private byIdCache = new Map<number, Observable<ApiResponse<Espace>>>();

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
    if (this.allByEntityCache.has(entityId)) {
      return this.allByEntityCache.get(entityId)!;
    }
    const obs = this.api.get<Espace[]>(`${this.endpoint}/entity/${entityId}`).pipe(
      map((resp: any) => Array.isArray(resp) ? ({ success: true, data: resp } as ApiResponse<Espace[]>) : resp),
      shareReplay(1)
    );
    this.allByEntityCache.set(entityId, obs);
    return obs;
  }

  getById(id: number): Observable<ApiResponse<Espace>> {
    if (this.byIdCache.has(id)) {
      return this.byIdCache.get(id)!;
    }
    const obs = this.api.get<Espace>(`${this.endpoint}/${id}`).pipe(
      map((resp: any) => (resp && resp.data !== undefined) ? resp : ({ success: true, data: resp } as ApiResponse<Espace>)),
      shareReplay(1)
    );
    this.byIdCache.set(id, obs);
    return obs;
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
    return this.api.post<Espace>(this.endpoint, payload).pipe(
      map((resp) => {
        // Invalidate caches for the entity
        const entId = (payload as any).entityId;
        if (entId) this.allByEntityCache.delete(entId);
        return resp;
      })
    );
  }

  update(id: number, data: UpdateEspaceDto): Observable<ApiResponse<Espace>> {
    return this.api.put<Espace>(`${this.endpoint}/${id}`, data).pipe(
      map((resp) => {
        // Invalidate caches for this id and, conservatively, list caches
        this.byIdCache.delete(id);
        this.allByEntityCache.clear();
        return resp;
      })
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      map((resp) => {
        // Invalidate caches on deletion
        this.byIdCache.delete(id);
        this.allByEntityCache.clear();
        return resp;
      })
    );
  }
}
