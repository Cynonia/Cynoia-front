import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, first, map, tap, throwError } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { AuthService } from './auth.service';

export interface ConversationParticipant {
  userId: number;
  conversationId: number;
  role?: string | null;
  joinedAt: Date;
  lastReadAt?: Date | null;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string | null;
  } | null;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  kind?: string;
  createdAt: Date;
  sender?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string | null;
  } | null;
}

export interface Conversation {
  id: number;
  type?: string; // PRIVATE | GROUP (as per backend)
  name?: string | null;
  entitiesId?: number;
  createdById?: number;
  createdAt: Date;
  updatedAt: Date;
  participants?: ConversationParticipant[];
  messages?: Message[];
  lastMessage?: Message | null;
}

export interface ListMessagesOptions {
  limit?: number;
  cursor?: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  // Cache messages per conversation id
  private messagesMap = new Map<number, BehaviorSubject<Message[]>>();

  constructor(private api: ApiService, private auth: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {}

  // Normalize API response to support both wrapped { data } and raw payloads
  private extractData<T>(resp: any): T {
    if (resp && typeof resp === 'object' && 'data' in resp) {
      return resp.data as T;
    }
    return resp as T;
  }

  // Util mappers
  private mapMessage = (m: any): Message => ({
    ...m,
    createdAt: m?.createdAt ? new Date(m.createdAt) : new Date(),
  });

  private mapConversation = (c: any): Conversation => ({
    ...c,
    createdAt: c?.createdAt ? new Date(c.createdAt) : new Date(),
    updatedAt: c?.updatedAt ? new Date(c.updatedAt) : new Date(),
    participants: Array.isArray(c?.participants)
      ? c.participants.map((p: any) => ({
          ...p,
          joinedAt: p?.joinedAt ? new Date(p.joinedAt) : new Date(),
          lastReadAt: p?.lastReadAt ? new Date(p.lastReadAt) : null,
        }))
      : undefined,
    messages: Array.isArray(c?.messages) ? c.messages.map(this.mapMessage) : undefined,
    lastMessage: c?.lastMessage ? this.mapMessage(c.lastMessage) : c?.messages?.[0] ? this.mapMessage(c.messages[0]) : null,
  });

  // Conversations
  refreshConversations(): Observable<Conversation[]> {
    if (!isPlatformBrowser(this.platformId)) {
      // SSR: avoid network calls during prerender
      this.conversationsSubject.next([]);
      return new BehaviorSubject<Conversation[]>([]).asObservable();
    }
    return this.api.get<Conversation[]>('/chats').pipe(
      map((resp) => {
        const data = this.extractData<any>(resp);
        const list = Array.isArray(data) ? data : [];
        return list.map(this.mapConversation);
      }),
      tap((data) => this.conversationsSubject.next(data))
    );
  }

  getConversationsSnapshot(): Conversation[] {
    return this.conversationsSubject.value;
  }

  getConversationById(id: number): Conversation | undefined {
    return this.conversationsSubject.value.find((c) => c.id === id);
  }

  // Messages
  private ensureMessagesSubject(conversationId: number): BehaviorSubject<Message[]> {
    if (!this.messagesMap.has(conversationId)) {
      this.messagesMap.set(conversationId, new BehaviorSubject<Message[]>([]));
    }
    return this.messagesMap.get(conversationId)!;
  }

  // Merge messages and remove duplicates by id, keep oldest → newest
  private upsertMessages(conversationId: number, incoming: Message | Message[]): void {
    const subj = this.ensureMessagesSubject(conversationId);
    const current = subj.value;
    const add = Array.isArray(incoming) ? incoming : [incoming];
    const byId = new Map<number, Message>();
    for (const m of current) byId.set(m.id, m);
    for (const m of add) byId.set(m.id, m);
    const merged = Array.from(byId.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    subj.next(merged);
  }

  messages$(conversationId: number): Observable<Message[]> {
    return this.ensureMessagesSubject(conversationId).asObservable();
  }

  listMessages(conversationId: number, opts: ListMessagesOptions = {}): Observable<Message[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return new BehaviorSubject<Message[]>([]).asObservable();
    }
    const params: any = {};
    if (opts.limit) params.limit = opts.limit;
    if (opts.cursor) params.cursor = opts.cursor;

    return this.api.get<Message[]>(`/chats/${conversationId}/messages`, params).pipe(
      map((resp) => {
        const data = this.extractData<any>(resp);
        const list = Array.isArray(data) ? data : [];
        const msgs = list.map(this.mapMessage);
        // Oldest first, newest last (bottom)
        msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return msgs;
      }),
      tap((msgs) => this.upsertMessages(conversationId, msgs))
    );
  }

  // Creating conversations
  createOrGetPrivateConversation(targetUserId: number): Observable<Conversation> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Unavailable during SSR'));
    }
    // OpenAPI expects { peerUserId }
    const payload = { peerUserId: targetUserId } as any;
    return this.api.post<Conversation>('/chats/private', payload).pipe(
      map((resp) => this.mapConversation(this.extractData<any>(resp))),
      tap((conv) => {
        const list = this.conversationsSubject.value;
        const idx = list.findIndex((c) => c.id === conv.id);
        if (idx >= 0) {
          list[idx] = conv;
          this.conversationsSubject.next([...list]);
        } else {
          this.conversationsSubject.next([conv, ...list]);
        }
      })
    );
  }

  createGroupConversation(name: string, participantUserIds: number[]): Observable<Conversation> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Unavailable during SSR'));
    }
    // OpenAPI expects { name, memberIds }
    const payload = { name, memberIds: participantUserIds } as any;
    return this.api.post<Conversation>('/chats/group', payload).pipe(
      map((resp) => this.mapConversation(this.extractData<any>(resp))),
      tap((conv) => this.conversationsSubject.next([conv, ...this.conversationsSubject.value]))
    );
  }

  // Sending messages
  sendMessage(conversationId: number, content: string, kind: string = 'TEXT'): Observable<Message> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Unavailable during SSR'));
    }
    const payload = { conversationId, content, kind };
    return this.api.post<Message>('/chats/message', payload).pipe(
      map((resp) => this.mapMessage(this.extractData<any>(resp))),
      tap((msg) => {
        this.upsertMessages(conversationId, msg);
        // update last message in conversations list
        const list = this.conversationsSubject.value;
        const idx = list.findIndex((c) => c.id === conversationId);
        if (idx >= 0) {
          const updated: Conversation = { ...list[idx], lastMessage: msg, updatedAt: msg.createdAt };
          this.conversationsSubject.next([updated, ...list.filter((c, i) => i !== idx)]);
        }
      })
    );
  }
}
