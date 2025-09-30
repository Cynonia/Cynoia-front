import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastLevel = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  level: ToastLevel;
  title?: string;
  message: string;
  ttl?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new Subject<ToastMessage | null>();

  get messages() {
    return this.toasts$.asObservable();
  }

  private makeId() {
    return Math.random().toString(36).slice(2, 9);
  }

  show(message: string, level: ToastLevel = 'info', title?: string, ttl = 5000) {
    const t: ToastMessage = {
      id: this.makeId(),
      level,
      title,
      message,
      ttl
    };
    this.toasts$.next(t);
    return t.id;
  }

  success(message: string, title?: string, ttl = 4000) {
    return this.show(message, 'success', title, ttl);
  }

  error(message: string, title?: string, ttl = 6000) {
    return this.show(message, 'error', title, ttl);
  }

  info(message: string, title?: string, ttl = 4000) {
    return this.show(message, 'info', title, ttl);
  }

  warning(message: string, title?: string, ttl = 5000) {
    return this.show(message, 'warning', title, ttl);
  }

  // send null to request clear by id in the future (not used)
  clear() {
    this.toasts$.next(null);
  }
}
// import { Injectable } from '@angular/core';
// import { ToastrService } from 'ngx-toastr';

// @Injectable({
//   providedIn: 'root'
// })
// export class ToastService {
//   constructor(private toastr: ToastrService) {}

//   success(message: string, title?: string) {
//     this.toastr.success(message, title);
//   }

//   error(message: string, title?: string) {
//     this.toastr.error(message, title);
//   }

//   info(message: string, title?: string) {
//     this.toastr.info(message, title);
//   }

//   warning(message: string, title?: string) {
//     this.toastr.warning(message, title);
//   }
// }
