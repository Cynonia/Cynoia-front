import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-16">
      <div class="max-w-md mx-auto">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <ng-content select="[slot=icon]">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </ng-content>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-gray-600 mb-6">{{ description }}</p>
        <button 
          *ngIf="buttonText"
          (click)="onButtonClick()"
          class="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg transition-colors">
          <svg *ngIf="showIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          {{ buttonText }}
        </button>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title: string = 'Aucun élément trouvé';
  @Input() description: string = 'Il n\'y a rien à afficher pour le moment.';
  @Input() buttonText: string = '';
  @Input() showIcon: boolean = true;
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}