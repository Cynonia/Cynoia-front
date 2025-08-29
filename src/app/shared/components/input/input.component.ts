import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-4">
      @if(icon){
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <ng-content select="[slot=icon]"></ng-content>
      </div>

      }
      <label for="">{{label}}</label>
      <input
        [type]="type"
        [placeholder]="placeholder"
        [class]="inputClasses"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
        class="text-slate-800"
      />
      @if(type === "password" && showToggle){

      <button
        type="button"
        (click)="togglePassword()"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
      >
        <ng-content select="[slot=toggle-icon]"></ng-content>
      </button>
      }
    </div>
    @if(error && touched){

      <div class="mt-1 text-red-400 text-sm">
        {{ error }}
      </div>
    }
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() icon = false;
  @Input() showToggle = false;
  @Input() error = '';
  @Input() touched = false;
  @Input() disabled = false;
  @Input() label = "";

  value = '';
  private onChange = (value: string) => {};
  onTouched = () => {};

  get inputClasses(): string {
    const baseClasses =
      'w-full py-3 bg-white/10 border border-gray-400 rounded-lg text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200';
    const paddingClasses = this.icon ? 'pl-10' : 'pl-4';
    const rightPadding = this.showToggle ? 'pr-12' : 'pr-4';
    return `${baseClasses} ${paddingClasses} ${rightPadding}`;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  togglePassword(): void {
    this.type = this.type === 'password' ? 'text' : 'password';
  }
}
