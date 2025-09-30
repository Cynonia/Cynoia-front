import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { organisationDto } from '../../../types/organisationDto';
import { AuthService } from './auth.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { BackendResponse } from '../../../types/backendResponse';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  constructor(private api: ApiService, private authService: AuthService) {}

  createOrganisation(payload: organisationDto): Observable<ApiResponse<organisationDto>> {
    return this.api.post<organisationDto>('/entities', payload).pipe(
      tap((response) => console.log(response)),
      catchError((error) => throwError(() => error))
    );
  }
}
