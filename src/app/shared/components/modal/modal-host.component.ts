import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService, ModalRequest } from '../../../core/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngFor="let m of active" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="bg-white rounded-lg shadow-lg z-10 p-6 w-96">
        <h3 class="text-lg font-semibold mb-2">{{ m.options?.title || (m.type === 'confirm' ? 'Confirmer' : 'Saisir') }}</h3>
        <p class="text-sm text-gray-600 mb-4">{{ m.options?.message }}</p>

        <div *ngIf="m.type === 'prompt'" class="mb-4">
          <input [(ngModel)]="prompts[m.id]" class="w-full border px-3 py-2 rounded" />
        </div>

        <div class="flex justify-end gap-2">
          <button (click)="close(m, null)" class="px-4 py-2 rounded border">{{ m.options?.cancelText || 'Annuler' }}</button>
          <button (click)="confirm(m)" class="px-4 py-2 rounded btn-primary text-white">{{ m.options?.confirmText || 'OK' }}</button>
        </div>
      </div>
    </div>
  `
})
export class ModalHostComponent implements OnInit, OnDestroy {
  active: ModalRequest[] = [];
  prompts: { [id: string]: string } = {};

  private sub?: Subscription;

  constructor(private modal: ModalService) {}

  ngOnInit(): void {
    this.sub = this.modal.requests.subscribe((req: ModalRequest) => {
      this.active.push(req);
      // initialize prompt value
      if (req.type === 'prompt') {
        this.prompts[req.id] = (req.options && req.options.placeholder) || '';
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  confirm(req: ModalRequest) {
    if (req.type === 'prompt') {
      const value = this.prompts[req.id] ?? null;
      req.responseSubject.next(value);
      req.responseSubject.complete();
      delete this.prompts[req.id];
    } else {
      req.responseSubject.next(true);
      req.responseSubject.complete();
    }
    this.remove(req);
  }

  close(req: ModalRequest, value: any) {
    // sending null on cancel
    req.responseSubject.next(value ?? null);
    req.responseSubject.complete();
    if (req.type === 'prompt') {
      delete this.prompts[req.id];
    }
    this.remove(req);
  }

  private remove(req: ModalRequest) {
    this.active = this.active.filter(r => r.id !== req.id);
  }
}
