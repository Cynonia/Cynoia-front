import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  name: string;
  role: string; // Changé pour accepter n'importe quel string
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface GroupChat {
  id: string;
  name: string;
  type: 'workers' | 'team';
  participants: User[];
  unreadCount: number;
  lastMessage?: Message;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private groupChatsSubject = new BehaviorSubject<GroupChat[]>([]);
  private usersSubject = new BehaviorSubject<User[]>([]);
  private messagesSubject = new BehaviorSubject<Message[]>([]);

  public conversations$ = this.conversationsSubject.asObservable();
  public groupChats$ = this.groupChatsSubject.asObservable();
  public users$ = this.usersSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();

  private currentUser: User = {
    id: '1',
    name: 'Utilisateur Actuel',
    role: 'MANAGER',
    avatar: 'https://via.placeholder.com/40',
    isOnline: true,
    lastSeen: new Date()
  };

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('🔍 Debug User Info:', {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          entity: user.entity
        });
        
        this.currentUser = {
          id: user.id?.toString() || '1',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur',
          role: user.role || 'MEMBER', // Garder le rôle tel quel
          avatar: 'https://via.placeholder.com/40',
          isOnline: true,
          lastSeen: new Date()
        };
        
        console.log('🔍 Current User for Messaging:', this.currentUser);
      }
      this.initializeData();
    });
  }

  private initializeData(): void {
    this.loadUsers();
    this.loadConversations();
    this.loadGroupChats();
    this.loadMessages();
  }

  // Getters publics
  getCurrentUser(): User {
    return this.currentUser;
  }

  getConversations(): Conversation[] {
    return this.conversationsSubject.value;
  }

  getGroupChats(): GroupChat[] {
    return this.groupChatsSubject.value;
  }

  getAllUsers(): User[] {
    return this.usersSubject.value;
  }

  // Créer une nouvelle conversation
  createConversation(participants: User[]): Conversation {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participants: participants,
      lastMessage: undefined,
      unreadCount: 0
    };

    const currentConversations = this.conversationsSubject.value;
    this.conversationsSubject.next([newConversation, ...currentConversations]);
    
    return newConversation;
  }

  // Obtenir les messages d'une conversation
  getConversationMessages(conversationId: string): Message[] {
    return this.messagesSubject.value.filter(message => message.conversationId === conversationId);
  }

  // Obtenir les messages d'un chat de groupe
  getGroupChatMessages(groupChatId: string): Message[] {
    return this.messagesSubject.value.filter(message => message.conversationId === groupChatId);
  }

  // Envoyer un message
  sendMessage(conversationId: string, content: string): void {
    const message: Message = {
      id: Date.now().toString(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      content: content,
      timestamp: new Date(),
      conversationId: conversationId
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);

    console.log('Message envoyé:', message);
  }

  // Vérifier l'accès au chat équipe
  canAccessTeamChat(): boolean {
    // Rôles qui peuvent accéder au chat équipe
    const allowedRoles = ['MANAGER', 'OWNER', 'STAFF', 'GESTIONNAIRE', 'PROPRIETAIRE'];
    
    console.log('🔍 Checking team chat access:', {
      currentUserRole: this.currentUser.role,
      allowedRoles: allowedRoles,
      hasAccess: allowedRoles.includes(this.currentUser.role?.toUpperCase())
    });
    
    return allowedRoles.includes(this.currentUser.role?.toUpperCase());
  }

  private loadUsers(): void {
    const mockUsers: User[] = [
      {
        id: '2',
        name: 'Marie Dubois',
        role: 'MANAGER',
        avatar: 'https://via.placeholder.com/40',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        id: '3',
        name: 'Jean Martin',
        role: 'MEMBER',
        avatar: 'https://via.placeholder.com/40',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: '4',
        name: 'Sophie Laurent',
        role: 'STAFF',
        avatar: 'https://via.placeholder.com/40',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        id: '5',
        name: 'Pierre Dupont',
        role: 'MEMBER',
        avatar: 'https://via.placeholder.com/40',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ];

    this.usersSubject.next(mockUsers);
  }

  private loadConversations(): void {
    const users = this.usersSubject.value;
    if (users.length === 0) return;

    const mockConversations: Conversation[] = [
      {
        id: 'conv1',
        participants: [users[0]],
        lastMessage: {
          id: 'msg1',
          senderId: users[0].id,
          senderName: users[0].name,
          content: 'Bonjour, comment allez-vous ?',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          conversationId: 'conv1'
        },
        unreadCount: 2
      },
      {
        id: 'conv2',
        participants: [users[1]],
        lastMessage: {
          id: 'msg2',
          senderId: this.currentUser.id,
          senderName: this.currentUser.name,
          content: 'Merci pour votre aide !',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          conversationId: 'conv2'
        },
        unreadCount: 0
      }
    ];

    this.conversationsSubject.next(mockConversations);
  }

  private loadGroupChats(): void {
    const users = this.usersSubject.value;
    
    const mockGroupChats: GroupChat[] = [
      {
        id: 'workers-chat',
        name: 'Chat Workers',
        type: 'workers',
        participants: users,
        unreadCount: 5,
        lastMessage: {
          id: 'gmsg1',
          senderId: users[0]?.id || '2',
          senderName: users[0]?.name || 'Marie',
          content: 'Réunion demain à 14h',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          conversationId: 'workers-chat'
        }
      }
    ];

    // Ajouter le chat équipe seulement si l'utilisateur y a accès
    if (this.canAccessTeamChat()) {
      const teamUsers = users.filter(user => {
        const allowedRoles = ['MANAGER', 'OWNER', 'STAFF', 'GESTIONNAIRE', 'PROPRIETAIRE'];
        return allowedRoles.includes(user.role?.toUpperCase());
      });
      
      console.log('🔍 Team users:', teamUsers);
      
      mockGroupChats.push({
        id: 'team-chat',
        name: 'Chat Équipe',
        type: 'team',
        participants: teamUsers,
        unreadCount: 1,
        lastMessage: {
          id: 'gmsg2',
          senderId: users.find(u => u.role?.toUpperCase() === 'STAFF')?.id || '4',
          senderName: users.find(u => u.role?.toUpperCase() === 'STAFF')?.name || 'Sophie',
          content: 'Budget approuvé pour le projet',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          conversationId: 'team-chat'
        }
      });
    }

    this.groupChatsSubject.next(mockGroupChats);
  }

  private loadMessages(): void {
    const mockMessages: Message[] = [
      {
        id: 'msg1',
        senderId: '2',
        senderName: 'Marie Dubois',
        content: 'Bonjour, comment allez-vous ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        conversationId: 'conv1'
      },
      {
        id: 'msg2',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        content: 'Très bien merci ! Et vous ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        conversationId: 'conv1'
      },
      {
        id: 'msg3',
        senderId: '2',
        senderName: 'Marie Dubois',
        content: 'Parfait ! Avez-vous eu le temps de regarder le dossier ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        conversationId: 'conv1'
      },
      // Messages du chat workers
      {
        id: 'gmsg1',
        senderId: '2',
        senderName: 'Marie Dubois',
        content: 'Réunion demain à 14h',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        conversationId: 'workers-chat'
      },
      {
        id: 'gmsg2',
        senderId: '3',
        senderName: 'Jean Martin',
        content: 'Parfait, je serai là !',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        conversationId: 'workers-chat'
      },
      {
        id: 'gmsg3',
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        content: 'Merci pour l\'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        conversationId: 'workers-chat'
      }
    ];

    // Ajouter messages équipe si accès autorisé
    if (this.canAccessTeamChat()) {
      mockMessages.push(
        {
          id: 'tmsg1',
          senderId: '4',
          senderName: 'Sophie Laurent',
          content: 'Budget approuvé pour le projet',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          conversationId: 'team-chat'
        },
        {
          id: 'tmsg2',
          senderId: this.currentUser.id,
          senderName: this.currentUser.name,
          content: 'Excellente nouvelle !',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          conversationId: 'team-chat'
        }
      );
    }

    this.messagesSubject.next(mockMessages);
  }
}