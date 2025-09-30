import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'ui-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center">
  <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6" [style.background]="'linear-gradient(135deg, var(--primary-color), rgba(0,0,0,0.08))'">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-white mb-2">{{ title }}</h1>
      <p class="text-slate-300 text-lg">{{ subtitle }}</p>
      <p *ngIf="description" class="text-slate-400 mt-2">{{ description }}</p>
    </div>
  `
})
export class LogoComponent {
  @Input() title = 'Cynoia';
  @Input() subtitle = 'Team Communication & Collaboration';
  @Input() description = 'All-in-one Workspace';
}

// ===================================
// shared/ui/social-button/social-button.component.ts
// ===================================
@Component({
  selector: 'ui-social-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="inline-flex justify-center items-center py-2.5 px-4 border border-white/20 rounded-lg shadow-sm bg-white/10 text-sm font-medium text-slate-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
      (click)="onClick()"
    >
      <ng-content select="[slot=icon]"></ng-content>
      <span class="ml-2">{{ label }}</span>
    </button>
  `
})
export class SocialButtonComponent {
  @Input() provider = '';
  @Input() label = '';

  onClick(): void {
    console.log(`Sign in with ${this.provider}`);
  }
}