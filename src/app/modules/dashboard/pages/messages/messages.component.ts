import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService, Conversation, GroupChat, User, Message } from '../../../../core/services/messaging.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen flex bg-gray-50">
      <!-- Sidebar gauche -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-lg font-semibold text-gray-900">Messages</h1>
            <div></div>
          </div>
          <p class="text-sm text-gray-600">Communiquez avec les membres</p>
        </div>

        <!-- Onglets -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button 
              (click)="activeTab = 'private'"
              [class]="getTabClass('private')"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors">
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Messages privés
            </button>
          </div>
          
          <div class="flex space-x-1 mt-2">
            <button 
              (click)="activeTab = 'workers'"
              [class]="getTabClass('workers')"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Chat Workers
              <span *ngIf="getWorkersUnreadCount() > 0" 
                    class="ml-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {{ getWorkersUnreadCount() }}
              </span>
            </button>
            
            <button 
              *ngIf="canAccessTeamChat"
              (click)="activeTab = 'team'"
              [class]="getTabClass('team')"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              Chat Équipe
              <span *ngIf="getTeamUnreadCount() > 0" 
                    class="ml-2 bg-purple-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {{ getTeamUnreadCount() }}
              </span>
            </button>
          </div>
        </div>

        <!-- Barre de recherche pour messages privés -->
        <div *ngIf="activeTab === 'private'" class="p-4 border-b border-gray-200">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher un membre..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
          </div>
        </div>

        <!-- Liste des conversations/utilisateurs -->
        <div class="flex-1 overflow-y-auto">
          <!-- Messages privés -->
          <div *ngIf="activeTab === 'private'">
            <!-- Conversations existantes -->
            <div *ngIf="conversations.length > 0" class="p-2">
              <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">Conversations récentes</h3>
              <div *ngFor="let conversation of conversations" 
                   (click)="selectConversation(conversation)"
                   [class]="getConversationClass(conversation)"
                   class="flex items-center p-3 rounded-lg cursor-pointer transition-colors">
                <div class="relative">
                  <img [src]="conversation.participants[0].avatar" 
                       [alt]="conversation.participants[0].name"
                       class="w-10 h-10 rounded-full">
                  <div *ngIf="conversation.participants[0].isOnline" 
                       class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ conversation.participants[0].name }}
                    </p>
                    <span class="text-xs text-gray-500">
                      {{ formatTime(conversation.lastMessage?.timestamp) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 truncate">
                    {{ conversation.participants[0].role | titlecase }}
                  </p>
                  <p *ngIf="conversation.lastMessage" class="text-xs text-gray-500 truncate mt-1">
                    {{ conversation.lastMessage.content }}
                  </p>
                </div>
                <div *ngIf="conversation.unreadCount > 0" 
                     class="ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {{ conversation.unreadCount }}
                </div>
              </div>
            </div>

            <!-- Membres connectés -->
            <div class="p-2">
              <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Membres connectés ({{ onlineUsers.length }})
              </h3>
              <div *ngFor="let user of getFilteredOnlineUsers()" 
                   (click)="startConversationWith(user)"
                   class="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div class="relative">
                  <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-semibold">{{ getInitials(user.name) }}</span>
                  </div>
                  <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-600">{{ user.role | titlecase }}</p>
                </div>
              </div>
            </div>

            <!-- Membres hors ligne -->
            <div class="p-2" *ngIf="getFilteredOfflineUsers().length > 0">
              <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                Hors ligne
              </h3>
              <div *ngFor="let user of getFilteredOfflineUsers()" 
                   (click)="startConversationWith(user)"
                   class="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div class="relative">
                  <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-semibold">{{ getInitials(user.name) }}</span>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <div class="flex items-center">
                    <p class="text-xs text-gray-600">{{ user.role | titlecase }}</p>
                    <span class="text-xs text-gray-500 ml-2">{{ formatLastSeen(user.lastSeen) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat de groupe -->
          <div *ngIf="activeTab === 'workers' || activeTab === 'team'" class="p-2">
            <div *ngFor="let groupChat of getAvailableGroupChats()" 
                 (click)="selectGroupChat(groupChat)"
                 [class]="getGroupChatClass(groupChat)"
                 class="flex items-center p-4 rounded-lg cursor-pointer transition-colors mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900">{{ groupChat.name }}</p>
                  <div class="flex items-center">
                    <span *ngIf="groupChat.unreadCount > 0" 
                          class="bg-purple-500 text-white text-xs rounded-full px-2 py-1 mr-2">
                      {{ groupChat.unreadCount }}
                    </span>
                  </div>
                </div>
                <p class="text-xs text-gray-600">{{ groupChat.participants.length }} membres connectés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Zone de conversation -->
      <div class="flex-1 flex flex-col">
        <!-- État par défaut -->
        <div *ngIf="!activeConversation" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
            <p class="text-gray-600">Choisissez un membre dans la liste pour commencer à discuter</p>
          </div>
        </div>

        <!-- Conversation active -->
        <div *ngIf="activeConversation" class="flex-1 flex flex-col">
          <!-- Header de conversation -->
          <div class="bg-white border-b border-gray-200 p-4">
            <div class="flex items-center">
              <div class="relative">
                <div *ngIf="isGroupChat(activeConversation)" 
                     class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div *ngIf="!isGroupChat(activeConversation)" class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-semibold">{{ getConversationInitials(activeConversation) }}</span>
                </div>
                <div *ngIf="!isGroupChat(activeConversation) && isUserOnline(activeConversation)" 
                     class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ getConversationName(activeConversation) }}</h3>
                <p class="text-sm text-gray-600">{{ getConversationStatus(activeConversation) }}</p>
              </div>
              <button class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" #messagesContainer>
            <div *ngFor="let message of getActiveMessages()" class="flex" 
                 [class.justify-end]="isMyMessage(message)">
              <div [class]="getMessageClass(message)" class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div *ngIf="!isMyMessage(message)" class="flex items-center mb-1">
                  <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                    <span class="text-white text-xs font-semibold">{{ getInitials(message.senderName) }}</span>
                  </div>
                  <span class="text-xs font-medium text-gray-700">{{ message.senderName }}</span>
                  <span class="text-xs text-gray-500 ml-2">{{ getRoleDisplay(message) }}</span>
                </div>
                <p class="text-sm">{{ message.content }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTime(message.timestamp) }}</p>
              </div>
            </div>
          </div>

          <!-- Zone de saisie -->
          <div class="bg-white border-t border-gray-200 p-4">
            <form (ngSubmit)="sendMessage()" class="flex items-center space-x-3">
              <div class="flex-1 relative">
                <input 
                  type="text" 
                  [(ngModel)]="newMessage"
                  name="message"
                  placeholder="{{ getMessagePlaceholder() }}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <button 
                type="submit" 
                [disabled]="!newMessage.trim()"
                class="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  activeTab: 'private' | 'workers' | 'team' = 'private';
  searchQuery = '';
  newMessage = '';
  
  conversations: Conversation[] = [];
  groupChats: GroupChat[] = [];
  allUsers: User[] = [];
  onlineUsers: User[] = [];
  offlineUsers: User[] = [];
  
  activeConversation: Conversation | GroupChat | null = null;
  activeMessages: Message[] = [];
  
  currentUser: User | null = null;
  canAccessTeamChat = false;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadData();
    this.checkTeamChatAccess();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private loadCurrentUser() {
    this.currentUser = this.messagingService.getCurrentUser();
  }

  private loadData() {
    // Charger les conversations
    this.messagingService.conversations$.subscribe((conversations: Conversation[]) => {
      this.conversations = conversations;
    });

    // Charger les chats de groupe
    this.messagingService.groupChats$.subscribe((groupChats: GroupChat[]) => {
      this.groupChats = groupChats;
    });

    // Charger les utilisateurs
    this.messagingService.users$.subscribe((users: User[]) => {
      this.allUsers = users;
      this.onlineUsers = users.filter((user: User) => user.isOnline);
      this.offlineUsers = users.filter((user: User) => !user.isOnline);
    });
  }

  private checkTeamChatAccess() {
    this.canAccessTeamChat = this.messagingService.canAccessTeamChat();
  }

  // Gestion des onglets
  getTabClass(tab: string): string {
    const baseClass = 'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors';
    if (this.activeTab === tab) {
      return baseClass + ' bg-white text-purple-700 shadow-sm';
    }
    return baseClass + ' text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  }

  // Recherche
  onSearchChange() {
    // Implémentation de la recherche en temps réel
  }

  getFilteredOnlineUsers(): User[] {
    if (!this.searchQuery.trim()) {
      return this.onlineUsers.filter(user => user.id !== this.currentUser?.id);
    }
    return this.onlineUsers.filter(user => 
      user.id !== this.currentUser?.id &&
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getFilteredOfflineUsers(): User[] {
    if (!this.searchQuery.trim()) {
      return this.offlineUsers.filter(user => user.id !== this.currentUser?.id);
    }
    return this.offlineUsers.filter(user => 
      user.id !== this.currentUser?.id &&
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Conversations
  selectConversation(conversation: Conversation) {
    this.activeConversation = conversation;
    this.loadMessages();
    // Marquer comme lu
    conversation.unreadCount = 0;
  }

  selectGroupChat(groupChat: GroupChat) {
    this.activeConversation = groupChat;
    this.loadMessages();
    // Marquer comme lu
    groupChat.unreadCount = 0;
  }

  startConversationWith(user: User) {
    // Vérifier si une conversation existe déjà
    let conversation = this.conversations.find((conv: Conversation) => 
      conv.participants.some((p: User) => p.id === user.id)
    );

    if (!conversation) {
      // Créer nouvelle conversation
      conversation = this.messagingService.createConversation([user]);
      this.conversations.unshift(conversation);
    }

    this.selectConversation(conversation);
  }

  private loadMessages() {
    if (!this.activeConversation) return;
    
    if (this.isGroupChat(this.activeConversation)) {
      this.activeMessages = this.messagingService.getGroupChatMessages(this.activeConversation.id);
    } else {
      this.activeMessages = this.messagingService.getConversationMessages(this.activeConversation.id);
    }
  }

  // Classes CSS
  getConversationClass(conversation: Conversation): string {
    const baseClass = 'flex items-center p-3 rounded-lg cursor-pointer transition-colors';
    if (this.activeConversation?.id === conversation.id) {
      return baseClass + ' bg-purple-50 border border-purple-200';
    }
    return baseClass + ' hover:bg-gray-50';
  }

  getGroupChatClass(groupChat: GroupChat): string {
    const baseClass = 'flex items-center p-4 rounded-lg cursor-pointer transition-colors mb-2';
    if (this.activeConversation?.id === groupChat.id) {
      return baseClass + ' bg-purple-50 border border-purple-200';
    }
    return baseClass + ' hover:bg-gray-50';
  }

  getMessageClass(message: Message): string {
    const baseClass = 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg';
    if (this.isMyMessage(message)) {
      return baseClass + ' bg-purple-600 text-white';
    }
    return baseClass + ' bg-gray-100 text-gray-900';
  }

  // Helpers
  isGroupChat(conversation: any): conversation is GroupChat {
    return conversation && 'type' in conversation;
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUser?.id;
  }

  isUserOnline(conversation: Conversation): boolean {
    return conversation.participants[0]?.isOnline || false;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getConversationInitials(conversation: any): string {
    if (this.isGroupChat(conversation)) {
      return conversation.name.charAt(0).toUpperCase();
    }
    return this.getInitials(conversation.participants[0]?.name || '');
  }

  getConversationName(conversation: any): string {
    if (this.isGroupChat(conversation)) {
      return conversation.name;
    }
    return conversation.participants[0]?.name || 'Utilisateur';
  }

  getConversationStatus(conversation: any): string {
    if (this.isGroupChat(conversation)) {
      return `${conversation.participants.length} membres`;
    }
    const participant = conversation.participants[0];
    if (participant?.isOnline) {
      return 'En ligne';
    }
    return 'Hors ligne';
  }

  getRoleDisplay(message: Message): string {
    const user = this.allUsers.find(u => u.id === message.senderId);
    return user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  }

  getMessagePlaceholder(): string {
    if (this.isGroupChat(this.activeConversation)) {
      return `Écrivez dans ${(this.activeConversation as GroupChat).name}...`;
    }
    return 'Tapez votre message...';
  }

  // Chats de groupe disponibles
  getAvailableGroupChats(): GroupChat[] {
    if (this.activeTab === 'workers') {
      return this.groupChats.filter(gc => gc.type === 'workers');
    }
    if (this.activeTab === 'team') {
      return this.groupChats.filter(gc => gc.type === 'team');
    }
    return [];
  }

  // Messages actifs
  getActiveMessages(): Message[] {
    return this.activeMessages;
  }

  // Compteurs non lus
  getWorkersUnreadCount(): number {
    return this.groupChats
      .filter(gc => gc.type === 'workers')
      .reduce((total, gc) => total + gc.unreadCount, 0);
  }

  getTeamUnreadCount(): number {
    return this.groupChats
      .filter(gc => gc.type === 'team')
      .reduce((total, gc) => total + gc.unreadCount, 0);
  }

  // Formatage des dates
  formatTime(timestamp: Date | undefined): string {
    if (!timestamp) return '';
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    
    return timestamp.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  formatLastSeen(lastSeen: Date | undefined): string {
    if (!lastSeen) return 'Jamais vu';
    
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 5) return 'Vu récemment';
    if (minutes < 60) return `Vu il y a ${minutes}m`;
    if (hours < 24) return `Vu il y a ${hours}h`;
    if (days < 7) return `Vu il y a ${days}j`;
    
    return `Vu le ${lastSeen.toLocaleDateString('fr-FR')}`;
  }

  // Envoi de message
  sendMessage() {
    if (!this.newMessage.trim() || !this.activeConversation || !this.currentUser) return;

    if (this.isGroupChat(this.activeConversation)) {
      this.messagingService.sendMessage(this.activeConversation.id, this.newMessage.trim());
    } else {
      this.messagingService.sendMessage(this.activeConversation.id, this.newMessage.trim());
    }

    this.activeMessages.push({
      id: Date.now().toString(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      content: this.newMessage.trim(),
      timestamp: new Date(),
      conversationId: this.activeConversation.id
    });

    this.newMessage = '';
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }
}