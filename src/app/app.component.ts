import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ModalHostComponent } from './shared/components/modal/modal-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ModalHostComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toasts></app-toasts>
    <app-modal-host></app-modal-host>
  `
})
export class AppComponent {
  title = 'cynoia-front';
}
