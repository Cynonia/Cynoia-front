import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { organisationDto } from '../../../types/organisationDto';
import { AuthService } from './auth.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { BackendResponse } from '../../../types/backendResponse';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  private readonly apiBaseUrl = environment.apiUrl || 'http://localhost:3000/api/v1/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createOrganisation(payload: organisationDto):Observable<BackendResponse<organisationDto>> {
    return this.http
      .post<BackendResponse<organisationDto>>(this.apiBaseUrl + 'entities', payload, {
        headers: { Authorization: 'Bearer ' + this.authService.token },
      })
      .pipe(
        tap((response) => console.log(response)),
        catchError((error) => throwError(() => error))
      );
  }
}
