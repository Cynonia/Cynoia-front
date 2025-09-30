import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick()"
    >
    @if(loading){

      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  get buttonClasses(): string {
    const baseClasses = 'inline-flex justify-center items-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'btn-primary shadow-lg hover:brightness-90',
      secondary: 'border border-white/20 shadow-sm bg-white/10 text-slate-200 hover:bg-white/20 focus-ring-primary',
      outline: 'border border-gray/20 text-slate-800 hover:bg-white/10 focus-ring-primary'
    };

    const sizeClasses = {
      sm: 'py-2 px-3 text-sm',
      md: 'py-2.5 px-4 text-sm',
      lg: 'py-3 px-4 text-sm'
    };

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${widthClass}`;
  }

  onClick(): void {
    // Button click logic handled by parent
  }
}