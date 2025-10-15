import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { MessagesService, Conversation as SvcConversation, Message as SvcMessage } from '../../../../core/services/messages.service';
import { MembersService } from '../../../../core/services/members.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { 
      display: block; 
      height: 100%;
      overflow: hidden;
    }
    
    /* Custom scrollbar for messages */
    .messages-scroll::-webkit-scrollbar {
      width: 6px;
    }
    .messages-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .messages-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }
    .messages-scroll::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
    
    /* Smooth message entry animation */
    @keyframes slideInMessage {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .message-bubble {
      animation: slideInMessage 0.2s ease-out;
    }
    
    /* Typing indicator animation */
    @keyframes typingDot {
      0%, 60%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      30% {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-typing-dot {
      animation: typingDot 1.4s infinite;
    }
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    /* Hover effects */
    .conversation-item:hover {
      transform: translateX(2px);
      transition: transform 0.2s ease;
    }
    
    /* Input focus glow */
    .message-input:focus {
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
  `],
  template: `
  <div class="h-[800px] flex flex-col sm:flex-row bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <!-- Sidebar gauche -->
      <div class="w-full sm:w-72 lg:w-80 bg-white border-b sm:border-r sm:border-b-0 border-gray-200 flex flex-col flex-shrink-0 shadow-sm sm:h-full overflow-hidden"
           [class.hidden]="activeConversation && isMobileView"
           [class.max-h-[40vh]]="!activeConversation"
           [class.sm:max-h-none]="true">
        <!-- Header avec gradient -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sm:p-4 flex-shrink-0">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <h1 class="text-base sm:text-lg font-bold text-white">Messages</h1>
            </div>
            <button (click)="openNewConversationModal()" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Nouvelle conversation">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
          
          <!-- Search with better styling -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="onSearchChange()" 
              placeholder="Rechercher..."
              class="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/90 backdrop-blur-sm border-0 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:bg-white transition-all" />
          </div>
        </div>

        <!-- Onglets améliorés -->
        <div class="px-3 py-2 sm:p-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <!-- Tab principale en haut -->
          <button 
            (click)="activeTab = 'private'"
            [class]="activeTab === 'private' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'"
            class="w-full px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span>Conversations privées</span>
            </div>
            <span *ngIf="conversations.length > 0" class="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              {{ conversations.length }}
            </span>
          </button>
          
          <!-- Tabs secondaires côte à côte -->
          <div class="grid grid-cols-2 gap-2">
            <button 
              (click)="activeTab = 'workers'"
              [class]="activeTab === 'workers' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              class="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="hidden sm:inline">Workers</span>
              <span class="sm:hidden">W</span>
              <span *ngIf="getWorkersUnreadCount() > 0" 
                    class="bg-blue-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {{ getWorkersUnreadCount() }}
              </span>
            </button>
            
            <button 
              *ngIf="canAccessTeamChat"
              (click)="activeTab = 'team'"
              [class]="activeTab === 'team' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
              class="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <span class="hidden sm:inline">Équipe</span>
              <span class="sm:hidden">E</span>
              <span *ngIf="getTeamUnreadCount() > 0" 
                    class="bg-purple-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {{ getTeamUnreadCount() }}
              </span>
            </button>
          </div>
        </div>

        

        <!-- Liste des conversations/utilisateurs -->
        <div class="flex-1 overflow-y-auto messages-scroll">
          <!-- Messages privés -->
          <div *ngIf="activeTab === 'private'">
            <!-- Conversations existantes -->
            <div *ngIf="conversations.length > 0" class="p-1 sm:p-2">
              <h3 class="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide px-2 sm:px-3 py-1 sm:py-2">Conversations récentes</h3>
              <div *ngFor="let conversation of conversations" 
                   (click)="selectConversation(conversation)"
                   [class]="getConversationClass(conversation)"
                   class="conversation-item grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 relative group">
                <!-- Quick actions on hover -->
                <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  <button class="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200" title="Archiver" (click)="$event.stopPropagation()">
                    <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Avatar -->
                <div class="relative flex-shrink-0">
                  <img *ngIf="conversation.participants[0].avatar; else noAvatarTpl"
                       [src]="conversation.participants[0].avatar" 
                       [alt]="conversation.participants[0].name"
                       class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm">
                  <ng-template #noAvatarTpl>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm" 
                         [ngStyle]="{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-foreground)' }">
                      <span class="text-xs sm:text-sm font-semibold">{{ getInitials(conversation.participants[0].name) }}</span>
                    </div>
                  </ng-template>
                  <div *ngIf="conversation.participants[0].isOnline" 
                       class="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <!-- Main -->
                <div class="min-w-0 pr-8">
                  <p class="text-xs sm:text-sm font-medium text-gray-900 truncate mb-0.5">{{ conversation.participants[0].name }}</p>
                  <p class="text-[10px] sm:text-xs truncate" 
                     [class.text-gray-900]="conversation.unreadCount > 0"
                     [class.font-semibold]="conversation.unreadCount > 0"
                     [class.text-gray-500]="conversation.unreadCount === 0"
                     *ngIf="conversation.lastMessage as lm">{{ lm.content || '' }}</p>
                </div>
                <!-- Meta -->
                <div class="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
                  <span class="text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">{{ formatTime(conversation.lastMessage?.timestamp) }}</span>
                  <span *ngIf="conversation.unreadCount > 0" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] sm:text-[10px] rounded-full px-1.5 sm:px-2 py-0.5 min-w-[18px] sm:min-w-[20px] text-center font-bold shadow-sm">
                    {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
                  </span>
                </div>
              </div>
            </div>

            

            
          </div>

          <!-- Chat de groupe -->
          <div *ngIf="activeTab === 'workers' || activeTab === 'team'" class="p-1 sm:p-2">
            <div *ngFor="let groupChat of getAvailableGroupChats()" 
                 (click)="selectGroupChat(groupChat)"
                 [class]="getGroupChatClass(groupChat)"
                 class="flex items-center p-2 sm:p-4 rounded-lg cursor-pointer transition-colors mb-1 sm:mb-2">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="ml-2 sm:ml-3 flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">{{ groupChat.name }}</p>
                  <div class="flex items-center flex-shrink-0">
                    <span *ngIf="groupChat.unreadCount > 0" 
                          class="bg-purple-500 text-white text-[10px] sm:text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 ml-2">
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
      <div class="flex-1 flex flex-col bg-white min-h-0">
        <!-- État par défaut -->
        <div *ngIf="!activeConversation" class="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
          <div class="text-center max-w-sm">
            <div class="w-16 h-16 sm:w-24 sm:h-24 bg-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg class="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-sm sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Sélectionnez une conversation</h3>
            <p class="text-xs sm:text-base text-gray-600">Choisissez un membre dans la liste pour commencer à discuter</p>
          </div>
        </div>

        <!-- Conversation active -->
        <div *ngIf="activeConversation" class="flex-1 flex flex-col min-h-0">
          <!-- Header de conversation -->
          <div class="bg-white border-b border-gray-200 p-2 sm:p-3 lg:p-4 flex-shrink-0">
            <div class="flex items-center gap-2 sm:gap-3">
              <!-- Back button for mobile -->
              <button (click)="goBackToList()" class="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <div class="relative flex-shrink-0">
                <div *ngIf="isGroupChat(activeConversation)" 
                     class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div *ngIf="!isGroupChat(activeConversation)" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  <ng-container *ngIf="activeConversation.participants[0]?.avatar; else fallbackInitials">
                    <img [src]="activeConversation.participants[0].avatar" [alt]="getConversationName(activeConversation)" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                  </ng-container>
                  <ng-template #fallbackInitials>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" 
                         [ngStyle]="{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-foreground)' }">
                      <span class="text-xs sm:text-sm font-semibold">{{ getConversationInitials(activeConversation) }}</span>
                    </div>
                  </ng-template>
                </div>
                <div *ngIf="!isGroupChat(activeConversation) && isUserOnline(activeConversation)" 
                     class="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs sm:text-sm font-medium text-gray-900 truncate">{{ getConversationName(activeConversation) }}</h3>
                <p class="text-[10px] sm:text-xs text-gray-600 truncate">{{ getConversationStatus(activeConversation) }}</p>
              </div>
              <button class="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4 messages-scroll bg-gradient-to-b from-gray-50/50 to-white" #messagesContainer>
            <div *ngFor="let message of getActiveMessages()" class="flex message-bubble" 
                 [class.justify-end]="isMyMessage(message)">
              <div [class]="getMessageClass(message)" [ngStyle]="getMessageStyle(message)" 
                   class="group max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] break-words whitespace-pre-wrap overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 relative">
                <!-- Message content -->
                <p class="text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
                
                <!-- Footer with time and status -->
                <div class="flex items-center gap-2 mt-1" [class.justify-end]="isMyMessage(message)">
                  <p class="text-[10px] sm:text-[11px] text-gray-400">{{ formatTime(message.timestamp) }}</p>
                  <!-- Delivery status for my messages -->
                  <div *ngIf="isMyMessage(message)" class="flex items-center gap-0.5">
                    <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Envoyé">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg class="w-3 h-3 text-blue-500 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Délivré">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                
                <!-- Quick actions on hover -->
                <div class="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg border border-gray-200 flex gap-1 p-1">
                  <button class="p-1.5 hover:bg-gray-100 rounded" title="Réagir" (click)="$event.stopPropagation()">
                    <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M15 10h.01M9 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  <button class="p-1.5 hover:bg-gray-100 rounded" title="Répondre" (click)="$event.stopPropagation()">
                    <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Typing indicator -->
            <div *ngIf="false" class="flex items-center gap-2 px-4 py-2">
              <div class="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
              <div class="bg-gray-200 rounded-2xl px-4 py-3 flex items-center gap-1">
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-typing-dot" style="animation-delay: 0s"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-typing-dot" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-typing-dot" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>

          <!-- Zone de saisie -->
          <div class="bg-white border-t border-gray-200 p-2 sm:p-3 shadow-lg flex-shrink-0">
            <form (ngSubmit)="sendMessage()" class="flex items-center gap-1 sm:gap-2">
              <button type="button" class="p-1.5 sm:p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex-shrink-0 transition-colors" aria-label="Joindre un fichier">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.44 11.05l-7.07 7.07a5 5 0 01-7.07-7.07l7.07-7.07a3 3 0 114.24 4.24l-7.07 7.07a1 1 0 11-1.41-1.41l6.36-6.36"/>
                </svg>
              </button>
              <div class="flex-1 min-w-0">
                <input 
                  type="text" 
                  [(ngModel)]="newMessage"
                  name="message"
                  placeholder="{{ getMessagePlaceholder() }}"
                  class="message-input w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
              </div>
              <button type="button" class="p-1.5 sm:p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex-shrink-0 transition-colors" aria-label="Emoji">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M15 10h.01M9 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
              <button 
                type="submit" 
                [disabled]="!newMessage.trim()"
                class="p-2 sm:p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-md"
                [ngStyle]="{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-foreground)' }">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- New Conversation Modal -->
    <div *ngIf="showNewConversationModal" 
         class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         (click)="closeNewConversationModal()">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
           (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-xl">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white">Nouvelle conversation</h2>
            <button (click)="closeNewConversationModal()" 
                    class="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Search -->
          <div class="mt-3 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="newConversationSearch"
              placeholder="Rechercher un utilisateur..."
              class="w-full pl-9 pr-3 py-2 text-sm bg-white/90 backdrop-blur-sm border-0 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:bg-white transition-all" />
          </div>
        </div>

        <!-- Users List -->
        <div class="flex-1 overflow-y-auto p-4">
          <div *ngIf="getFilteredAvailableUsers().length === 0" class="text-center py-8">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p class="text-gray-500 text-sm">Aucun utilisateur disponible</p>
          </div>

          <div *ngFor="let user of getFilteredAvailableUsers()"
               (click)="startNewConversationWith(user)"
               class="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors mb-2">
            <div class="relative flex-shrink-0">
              <img *ngIf="user.avatar" [src]="user.avatar" [alt]="user.name"
                   class="w-12 h-12 rounded-full border-2 border-white shadow-sm">
              <div *ngIf="!user.avatar"
                   class="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-gradient-to-br from-purple-500 to-indigo-500">
                <span class="text-white font-semibold">{{ getInitials(user.name) }}</span>
              </div>
              <span *ngIf="user.isOnline" 
                    class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ user.name }}</p>
              <p class="text-xs text-gray-500">{{ user.role }}</p>
            </div>
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
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
  isMobileView = false;
  showNewConversationModal = false;
  newConversationSearch = '';
  
  // Local UI types mirroring the previous mock service shapes
  conversations: Conversation[] = [];
  groupChats: GroupChat[] = [];
  allUsers: User[] = [];
  onlineUsers: User[] = [];
  offlineUsers: User[] = [];
  
  activeConversation: Conversation | GroupChat | null = null;
  activeMessages: Message[] = [];
  
  currentUser: User | null = null;
  currentUserId?: number;
  canAccessTeamChat = false;
  private messagesSub?: Subscription;

  constructor(
    private messagesService: MessagesService,
    private authService: AuthService,
    private membersService: MembersService
  ) {
    this.checkMobileView();
  }

  ngOnInit() {
    // Listen for window resize
    window.addEventListener('resize', () => this.checkMobileView());
    
    // Load members from entity
    this.membersService.refreshMembersFromApi().subscribe();
    
    // Load auth user then bootstrap data
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        this.currentUser = {
          id: (this.currentUserId ?? 0).toString(),
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur',
          role: (user.role || 'MEMBER').toString(),
          avatar: 'https://via.placeholder.com/40',
          isOnline: true,
          lastSeen: new Date()
        };
        console.log('[Messages] Current user:', {
          id: this.currentUserId,
          name: this.currentUser.name,
          role: this.currentUser.role
        });
        this.checkTeamChatAccess(user.role);
      }
      this.bootstrapData();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private bootstrapData() {
    // Load conversations from API-backed MessagesService
    this.messagesService.refreshConversations().subscribe();
    this.messagesService.conversations$.subscribe((convs) => {
      console.log('[Messages] Conversations from backend:', convs);
      const mapped = convs.map(c => this.mapConversationToUi(c));
      // Split into private and group for UI needs
      this.conversations = mapped.filter(c => !this.isGroupChat(c));
      this.groupChats = convs
        .filter(c => (c.type || '').toUpperCase() === 'GROUP')
        .map(c => this.mapConversationToGroupChat(c));
      console.log('[Messages] Mapped UI conversations:', this.conversations);
      console.log('[Messages] Group chats:', this.groupChats);

      // Build users list from chat participants (exclude current user, dedupe)
      const usersMap = new Map<string, User>();
      for (const conv of convs) {
        if (!Array.isArray(conv.participants)) continue;
        for (const p of conv.participants) {
          if (this.currentUserId && p.userId === this.currentUserId) continue;
          const id = String(p.userId);
          if (!usersMap.has(id)) {
            const fullName = p.user ? `${(p.user.firstName || '').trim()} ${(p.user.lastName || '').trim()}`.trim() : '';
            const name = fullName;
            usersMap.set(id, {
              id,
              name: name ,
              role: '',
              avatar: p.user?.avatar || 'https://via.placeholder.com/40',
              // Backend doesn't provide presence yet; mark as online for discoverability
              isOnline: true
            });
          }
        }
      }
      this.allUsers = Array.from(usersMap.values());
      this.onlineUsers = this.allUsers.filter(u => u.isOnline);
      this.offlineUsers = this.allUsers.filter(u => !u.isOnline);
      console.log('[Messages] Derived users from chats:', this.allUsers);
    });
  }

  private checkTeamChatAccess(role?: string) {
    const allowedRoles = ['MANAGER', 'OWNER', 'STAFF', 'GESTIONNAIRE', 'PROPRIETAIRE'];
    this.canAccessTeamChat = !!role && allowedRoles.includes(role.toUpperCase());
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
    console.log('[Messages] Selecting conversation:', conversation);
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
    // Try to create or retrieve a private conversation via API
    const targetId = typeof user.id === 'string' ? parseInt(user.id, 10) : (user.id as unknown as number);
    if (!targetId || Number.isNaN(targetId)) {
      console.warn('Cannot start conversation: invalid user id', user);
      return;
    }
    this.messagesService.createOrGetPrivateConversation(targetId).subscribe((conv) => {
      const uiConv = this.mapConversationToUi(conv);
      // Ensure display as just the user's full name; fallback to 'Utilisateur' (no id)
      if (uiConv.participants && uiConv.participants[0]) {
        const labelName = user?.name?.trim();
        uiConv.participants[0].name = labelName || 'Utilisateur';
      }
      // Prepend if not existing
      if (!this.conversations.find(c => c.id === uiConv.id)) {
        this.conversations.unshift(uiConv);
      }
      this.selectConversation(uiConv);
    });
  }

  private loadMessages() {
    if (!this.activeConversation) return;
    
    const convId = Number(this.activeConversation.id);
    // avoid stacking subscriptions when switching conversations
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = undefined;
    }
    console.log('[Messages] Loading messages for conversation id:', convId);
    this.messagesService.listMessages(convId).subscribe(msgs => {
      console.log('[Messages] listMessages returned', msgs?.length, 'messages');
    });
    this.messagesSub = this.messagesService.messages$(convId).subscribe((msgs) => {
      console.log('[Messages] messages$ update:', msgs?.length, 'messages');
      this.activeMessages = msgs.map(this.mapSvcMessageToUi);
      this.scrollToBottom();
    });
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
  // Base paddings and typography (slightly larger for WhatsApp-like feel)
  const common = 'px-5 py-3 text-[15px]';
    if (this.isMyMessage(message)) {
      // Sender bubble: brand color background, white text, rounded with slight tail on right
      return [
        common,
        'text-white',
        'rounded-2xl rounded-br-md',
      ].join(' ');
    }
    // Receiver bubble: white background, subtle border, rounded with slight tail on left
    return [
      common,
      'bg-white',
      'border border-gray-200',
      'text-gray-900',
      'rounded-2xl rounded-bl-md'
    ].join(' ');
  }

  getMessageStyle(message: Message): { [k: string]: string } | null {
    if (this.isMyMessage(message)) {
      return { backgroundColor: 'var(--primary-color)', color: 'var(--primary-foreground)' };
    }
    return null;
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

    const convId = Number(this.activeConversation.id);
    this.messagesService.sendMessage(convId, this.newMessage.trim()).subscribe(() => {
      // messages$ subscription will update the list
      this.newMessage = '';
      this.scrollToBottom();
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }

  // Mapping helpers
  private mapSvcMessageToUi(m: SvcMessage): Message {
    const senderName = m.sender ? `${m.sender.firstName || ''} ${m.sender.lastName || ''}`.trim() : 'Utilisateur';
    return {
      id: String(m.id),
      senderId: String(m.senderId),
      senderName: senderName || String(m.senderId),
      content: m.content,
      timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
      conversationId: m.conversationId
    };
  }

  private mapConversationToUi(c: SvcConversation): Conversation {
    const participants: User[] = [];
    const currentId = this.currentUserId;
    if (Array.isArray(c.participants) && c.participants.length > 0) {
      const other = c.participants.find(p => !currentId || p.userId !== currentId) || c.participants[0];
      const fullName = other?.user ? `${(other.user.firstName || '').trim()} ${(other.user.lastName || '').trim()}`.trim() : '';
      const name = fullName || 'Utilisateur';
      participants.push({
        id: String(other?.userId ?? ''),
        name: name,
        role: '',
        avatar: other?.user?.avatar || undefined,
        isOnline: true
      });
    }
    const last = c.lastMessage || (Array.isArray(c.messages) && c.messages.length > 0 ? c.messages[c.messages.length - 1] : undefined);
    const lastUi = last ? this.mapSvcMessageToUi(last) : undefined;
    return {
      id: c.id,
      participants,
      lastMessage: lastUi,
      unreadCount: 0
    };
  }

  private mapConversationToGroupChat(c: SvcConversation): GroupChat {
    const participants: User[] = (c.participants || []).map(p => ({
      id: String(p.userId),
      name: p.user && (`${(p.user.firstName || '').trim()} ${(p.user.lastName || '').trim()}`.trim())
        ? `${(`${(p.user.firstName || '').trim()} ${(p.user.lastName || '').trim()}`).trim()}`
        : 'Utilisateur',
      role: '',
      avatar: p.user?.avatar || 'https://via.placeholder.com/40',
      isOnline: false
    }));
    const last = c.lastMessage || (Array.isArray(c.messages) && c.messages.length > 0 ? c.messages[c.messages.length - 1] : undefined);
    const lastUi = last ? this.mapSvcMessageToUi(last) : undefined;
    return {
      id: c.id,
      name: c.name || 'Groupe',
      type: 'workers',
      participants,
      unreadCount: 0,
      lastMessage: lastUi
    };
  }

  // Mobile view helpers
  private checkMobileView() {
    this.isMobileView = window.innerWidth < 640; // sm breakpoint
  }

  goBackToList() {
    this.activeConversation = null;
    this.activeMessages = [];
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
      this.messagesSub = undefined;
    }
  }

  // New conversation modal methods
  openNewConversationModal() {
    this.showNewConversationModal = true;
    this.newConversationSearch = '';
  }

  closeNewConversationModal() {
    this.showNewConversationModal = false;
    this.newConversationSearch = '';
  }

  getFilteredAvailableUsers(): User[] {
    const search = this.newConversationSearch.toLowerCase();
    
    // Get all members from the entity
    const allMembers = this.membersService.getAllMembers();
    
    // Filter out current user and users we already have conversations with
    const existingUserIds = this.conversations.map(c => 
      c.participants && c.participants[0] ? c.participants[0].id : ''
    );
    
    // Convert MemberProfile to User interface and filter
    return allMembers
      .filter(m => 
        m.id !== this.currentUser?.id && 
        !existingUserIds.includes(m.id) &&
        (search === '' || m.name.toLowerCase().includes(search))
      )
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        avatar: m.avatar,
        isOnline: false, // Could be enhanced with real online status
        lastSeen: m.lastActivity
      }));
  }

  startNewConversationWith(user: User) {
    this.closeNewConversationModal();
    this.startConversationWith(user);
  }
}

// Local UI model interfaces (kept compatible with the existing template)
interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  conversationId?: string | number;
}

interface Conversation {
  id: string | number;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

interface GroupChat {
  id: string | number;
  name: string;
  type: 'workers' | 'team';
  participants: User[];
  unreadCount: number;
  lastMessage?: Message;
}

// Mapping helpers
// Map backend conversation to UI conversation (private chat)
// For private chats, we display the other participant as the first participant
// For group chats, use separate mapping to GroupChat
// If data is missing, fall back to reasonable defaults
//
// Note: relies on this.currentUserId being set