import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService, Conversation, GroupChat, User, Message } from '../../../core/services/messaging.service';

@Component({
  selector: 'app-messaging-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Bouton flottant -->
    <div class="fixed bottom-6 right-6 z-50">
      <button 
        *ngIf="!isOpen"
        (click)="toggleWidget()"
        class="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        
        <!-- Badge de notification -->
        <span *ngIf="totalUnread > 0" 
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
          {{ totalUnread > 9 ? '9+' : totalUnread }}
        </span>
      </button>

      <!-- Widget de messagerie -->
      <div *ngIf="isOpen" 
           class="bg-white rounded-lg shadow-xl border w-80 h-96 flex flex-col">
        
        <!-- Header -->
        <div class="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h3 class="font-semibold">Messages</h3>
          <div class="flex items-center space-x-2">
            <button (click)="openFullMessaging()" 
                    class="text-purple-200 hover:text-white p-1 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
              </svg>
            </button>
            <button (click)="toggleWidget()" 
                    class="text-purple-200 hover:text-white p-1 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Onglets rapides -->
        <div class="flex border-b bg-gray-50">
          <button 
            (click)="activeTab = 'recent'"
            [class]="activeTab === 'recent' ? 'text-purple-600 border-purple-600' : 'text-gray-600'"
            class="flex-1 py-2 px-4 text-sm font-medium border-b-2 border-transparent hover:text-purple-600">
            Récents
          </button>
          <button 
            (click)="activeTab = 'workers'"
            [class]="activeTab === 'workers' ? 'text-purple-600 border-purple-600' : 'text-gray-600'"
            class="flex-1 py-2 px-4 text-sm font-medium border-b-2 border-transparent hover:text-purple-600">
            Workers
          </button>
          <button 
            *ngIf="canAccessTeamChat"
            (click)="activeTab = 'team'"
            [class]="activeTab === 'team' ? 'text-purple-600 border-purple-600' : 'text-gray-600'"
            class="flex-1 py-2 px-4 text-sm font-medium border-b-2 border-transparent hover:text-purple-600">
            Équipe
          </button>
        </div>

        <!-- Liste des conversations/chats -->
        <div class="flex-1 overflow-y-auto">
          <!-- Conversations récentes -->
          <div *ngIf="activeTab === 'recent'">
            <div *ngFor="let conversation of getRecentConversations()" 
                 (click)="selectConversation(conversation)"
                 class="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b">
              <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span class="text-white text-xs font-semibold">
                  {{ getConversationInitials(conversation) }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ getConversationName(conversation) }}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {{ conversation.lastMessage?.content || 'Pas de messages' }}
                </p>
              </div>
              <div *ngIf="conversation.unreadCount > 0" 
                   class="bg-purple-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                {{ conversation.unreadCount }}
              </div>
            </div>
          </div>

          <!-- Chat Workers -->
          <div *ngIf="activeTab === 'workers'">
            <div *ngFor="let groupChat of getWorkersChats()" 
                 (click)="selectGroupChat(groupChat)"
                 class="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ groupChat.name }}</p>
                <p class="text-xs text-gray-500">{{ groupChat.participants.length }} membres</p>
              </div>
              <div *ngIf="groupChat.unreadCount > 0" 
                   class="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {{ groupChat.unreadCount }}
              </div>
            </div>
          </div>

          <!-- Chat Équipe -->
          <div *ngIf="activeTab === 'team' && canAccessTeamChat">
            <div *ngFor="let groupChat of getTeamChats()" 
                 (click)="selectGroupChat(groupChat)"
                 class="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b">
              <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ groupChat.name }}</p>
                <p class="text-xs text-gray-500">Management only</p>
              </div>
              <div *ngIf="groupChat.unreadCount > 0" 
                   class="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                {{ groupChat.unreadCount }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t">
          <button (click)="openFullMessaging()" 
                  class="w-full text-center text-purple-600 hover:text-purple-700 text-sm font-medium">
            Voir tous les messages
          </button>
        </div>
      </div>
    </div>
  `
})
export class MessagingWidgetComponent implements OnInit {
  isOpen = false;
  activeTab: 'recent' | 'workers' | 'team' = 'recent';
  totalUnread = 0;
  
  conversations: Conversation[] = [];
  groupChats: GroupChat[] = [];
  canAccessTeamChat = false;

  constructor(private messagingService: MessagingService) {}

  ngOnInit() {
    this.loadData();
    this.checkTeamAccess();
  }

  private loadData() {
    this.messagingService.conversations$.subscribe(conversations => {
      this.conversations = conversations;
      this.updateUnreadCount();
    });

    this.messagingService.groupChats$.subscribe(groupChats => {
      this.groupChats = groupChats;
      this.updateUnreadCount();
    });
  }

  private checkTeamAccess() {
    this.canAccessTeamChat = this.messagingService.canAccessTeamChat();
  }

  private updateUnreadCount() {
    const conversationUnread = this.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const groupUnread = this.groupChats.reduce((sum, gc) => sum + gc.unreadCount, 0);
    this.totalUnread = conversationUnread + groupUnread;
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
  }

  openFullMessaging() {
    // Navigation vers la page complète de messagerie
    window.location.href = '/dashboard/messages';
  }

  getRecentConversations(): Conversation[] {
    return this.conversations.slice(0, 5);
  }

  getWorkersChats(): GroupChat[] {
    return this.groupChats.filter(gc => gc.type === 'workers');
  }

  getTeamChats(): GroupChat[] {
    return this.groupChats.filter(gc => gc.type === 'team');
  }

  selectConversation(conversation: Conversation) {
    // Ouvrir la messagerie complète avec cette conversation
    this.openFullMessaging();
  }

  selectGroupChat(groupChat: GroupChat) {
    // Ouvrir la messagerie complète avec ce chat de groupe
    this.openFullMessaging();
  }

  getConversationName(conversation: Conversation): string {
    return conversation.participants[0]?.name || 'Utilisateur';
  }

  getConversationInitials(conversation: Conversation): string {
    const name = this.getConversationName(conversation);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}