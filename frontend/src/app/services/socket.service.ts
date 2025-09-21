import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  constructor() {}

  connect(token: string): void {
    if (!token || this.socket?.connected) return;

    this.socket = io(environment.apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection failed, falling back to HTTP:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  joinTicket(ticketId: number): void {
    if (this.socket) {
      this.socket.emit('join-ticket', ticketId);
    }
  }

  sendMessage(ticketId: number, message: string, isInternal: boolean = false): void {
    if (this.socket?.connected) {
      this.socket.emit('send-message', { ticketId, message, isInternal });
    } else {
      console.warn('⚠️ Socket not connected, message will be sent via HTTP only');
    }
  }

  updateStatus(ticketId: number, status: string): void {
    if (this.socket?.connected) {
      this.socket.emit('update-status', { ticketId, status });
    } else {
      console.warn('⚠️ Socket not connected, status will be updated via HTTP only');
    }
  }

  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('new-message', (message) => observer.next(message));
      }
    });
  }

  onStatusUpdate(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('status-updated', (data) => observer.next(data));
      }
    });
  }

  onMessageError(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('message-error', (error) => observer.next(error));
      }
    });
  }
}