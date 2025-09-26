import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-workers-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workers-layout.component.html'
})
export class WorkersLayoutComponent {
  pageTitle = 'Dashboard';
  reservationsCount = 1; // À connecter avec un vrai service
  reservationsActives = 1;
  reservationsEnAttente = 1;

  currentUser$: Observable<any | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}
