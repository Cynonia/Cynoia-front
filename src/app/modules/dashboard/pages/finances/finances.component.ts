import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EspaceService } from '../../../../core/services/espace.service';
import { ReservationsService } from '../../../../core/services/reservations.service';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">Finances</h2>
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="text-center py-20 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
          <p>Module finances en cours de développement</p>
        </div>
      </div>
    </div>
  `
})
export class FinancesComponent implements OnInit {
  constructor(private espaceService: EspaceService, private reservationsService: ReservationsService) {}

  ngOnInit(): void {
    // Trigger backend fetches for spaces and reservations on page access
    this.espaceService.getAll().subscribe();
    this.reservationsService.refreshFromApi();
  }
}