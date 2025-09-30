import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-96 max-w-full">
      <ng-container *ngFor="let t of toasts">
        <div [ngClass]="getToastClass(t.level)" class="rounded-lg shadow-lg p-3 flex items-start gap-3">
          <div class="flex-1">
            <div *ngIf="t.title" class="font-semibold">{{ t.title }}</div>
            <div class="text-sm">{{ t.message }}</div>
          </div>
          <button (click)="remove(t.id)" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
      </ng-container>
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  sub!: Subscription;

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toast.messages.subscribe(msg => {
      if (!msg) return; // ignore clear sentinel
      this.toasts = [msg, ...this.toasts];
      // schedule removal
      const ttl = msg.ttl ?? 5000;
      timer(ttl).subscribe(() => this.remove(msg.id));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getToastClass(level: string) {
    switch (level) {
      case 'success': return 'bg-white border border-green-200 text-green-800';
      case 'error': return 'bg-white border border-red-200 text-red-800';
      case 'warning': return 'bg-white border border-yellow-200 text-yellow-800';
      default: return 'bg-white border border-gray-200 text-gray-800';
    }
  }
}
