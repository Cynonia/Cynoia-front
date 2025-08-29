// import { Injectable } from '@angular/core';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { io, Socket } from 'socket.io-client';
// import { AuthService } from './auth.service';
// import { environment } from '../../../environments/environment';

// export interface SocketEvent {
//   type: string;
//   data: any;
//   timestamp: Date;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class SocketService {
//   private socket: Socket | null = null;
//   private connectionStatus = new BehaviorSubject<boolean>(false);
  
//   public isConnected$ = this.connectionStatus.asObservable();

//   constructor(private authService: AuthService) {
//     this.authService.currentUser$.subscribe(user => {
//       if (user) {
//         this.connect();
//       } else {
//         this.disconnect();
//       }
//     });
//   }

//   private connect(): void {
//     if (this.socket?.connected) return;

//     const token = this.authService.token;
//     if (!token) return;

//     this.socket = io(environment.socketUrl, {
//       auth: { token },
//       transports: ['websocket']
//     });

//     this.socket.on('connect', () => {
//       console.log('Socket connected');
//       this.connectionStatus.next(true);
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Socket disconnected');
//       this.connectionStatus.next(false);
//     });

//     this.socket.on('error', (error) => {
//       console.error('Socket error:', error);
//     });
//   }

//   private disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.connectionStatus.next(false);
//     }
//   }

//   emit(event: string, data: any): void {
//     if (this.socket?.connected) {
//       this.socket.emit(event, data);
//     }
//   }

//   on<T>(event: string): Observable<T> {
//     return new Observable(observer => {
//       if (this.socket) {
//         this.socket.on(event, (data: T) => observer.next(data));
//       }
      
//       return () => {
//         if (this.socket) {
//           this.socket.off(event);
//         }
//       };
//     });
//   }

//   joinRoom(roomId: string): void {
//     this.emit('join-room', { roomId });
//   }

//   leaveRoom(roomId: string): void {
//     this.emit('leave-room', { roomId });
//   }

//   sendMessage(roomId: string, message: any): void {
//     this.emit('send-message', { roomId, message });
//   }
// }