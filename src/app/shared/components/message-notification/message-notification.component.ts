import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../../../core/services/messaging.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="openMessages()"
      class="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition duration-150 ease-in-out">
      
      <!-- Icône messages -->
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      
      <!-- Badge de notification -->
      <span *ngIf="totalUnread > 0" 
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight">
        {{ totalUnread > 99 ? '99+' : totalUnread }}
      </span>
    </button>
  `,
  styles: [`
    button:hover .absolute {
      animation: pulse 2s infinite;
    }
  `]
})
export class MessageNotificationComponent implements OnInit {
  totalUnread = 0;

  constructor(
    private messagingService: MessagingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUnreadCount();
  }

  private loadUnreadCount() {
    // Calculer le nombre total de messages non lus
    this.messagingService.conversations$.subscribe(conversations => {
      const conversationUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      this.updateTotalUnread(conversationUnread);
    });

    this.messagingService.groupChats$.subscribe(groupChats => {
      const groupUnread = groupChats.reduce((sum, gc) => sum + gc.unreadCount, 0);
      this.updateTotalUnread(groupUnread);
    });
  }

  private updateTotalUnread(count: number) {
    this.totalUnread = count;
  }

  openMessages() {
    this.router.navigate(['/dashboard/messages']);
  }
}