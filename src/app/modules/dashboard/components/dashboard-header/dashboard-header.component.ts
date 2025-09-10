import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <h1 class="text-xl font-semibold text-slate-900">Dashboard</h1>
            </div>
          </div>

          <div class="flex items-center space-x-4" *ngIf="currentUser$ | async as user">
            <span class="text-sm text-slate-700">Welcome, {{ user.firstName + " " +user.lastName }}!</span>
            <ui-button
              variant="outline"
              size="sm"
              (clicked)="signOut()"
            >
              Sign Out
            </ui-button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class DashboardHeaderComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}

  signOut(): void {
    this.authService.signOut();
  }
}