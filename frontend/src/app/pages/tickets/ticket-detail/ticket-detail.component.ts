import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { Ticket, TicketMessage } from '../../../models/ticket.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="ticket-detail-container" *ngIf="ticket">
      <div class="ticket-header">
        <div class="header-content">
          <nav class="breadcrumb">
            <a routerLink="/dashboard" class="breadcrumb-link">🏠 Dashboard</a>
            <span class="breadcrumb-separator">></span>
            <a routerLink="/tickets/my" class="breadcrumb-link">My Tickets</a>
            <span class="breadcrumb-separator">></span>
            <span class="breadcrumb-current">Ticket #{{ticket.id}}</span>
          </nav>
          <div class="ticket-info">
            <h1>{{ticket.title}}</h1>
            <div class="ticket-meta">
              <span class="priority" [class]="'priority-' + ticket.priority">{{ticket.priority | uppercase}}</span>
              <span class="status" [class]="'status-' + ticket.status">{{getStatusLabel(ticket.status)}}</span>
              <span class="ticket-id">Ticket #{{ticket.id}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-content">
        <div class="ticket-details">
          <div class="detail-card">
            <h3>Ticket Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Created:</label>
                <span>{{ticket.created_at | date:'MMM d, yyyy h:mm a'}}</span>
              </div>
              <div class="detail-item">
                <label>SLA Deadline:</label>
                <span>{{ticket.sla_deadline | date:'MMM d, yyyy h:mm a'}}</span>
              </div>
              <div class="detail-item" *ngIf="ticket.category">
                <label>Category:</label>
                <span>{{ticket.category}}</span>
              </div>
              <div class="detail-item" *ngIf="ticket.agent_first_name">
                <label>Assigned Agent:</label>
                <span>{{ticket.agent_first_name}} {{ticket.agent_last_name}}</span>
              </div>
            </div>
            
            <!-- Status Update Section (Agents/Admins only) -->
            <div *ngIf="canUpdateStatus()" class="status-update-section">
              <h4>Update Status</h4>
              <div class="status-controls">
                <select [(ngModel)]="selectedStatus" class="status-select">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button (click)="updateStatus()" [disabled]="updatingStatus || selectedStatus === ticket.status" class="btn-update-status">
                  {{updatingStatus ? 'Updating...' : 'Update Status'}}
                </button>
              </div>
            </div>
            
            <div class="description">
              <label>Description:</label>
              <p>{{ticket.description}}</p>
            </div>
          </div>
        </div>

        <div class="messages-section">
          <div class="messages-card">
            <h3>Messages</h3>
            
            <div class="messages-list" *ngIf="messages.length > 0">
              <div *ngFor="let message of messages" class="message" 
                   [class.own-message]="message.sender_id === currentUserId"
                   [class.internal-note]="message.is_internal">
                <div class="message-header">
                  <span class="sender">{{message.first_name}} {{message.last_name}}</span>
                  <span class="role-badge" [class]="'role-' + message.role">{{message.role}}</span>
                  <span *ngIf="message.is_internal" class="internal-badge">Internal Note</span>
                  <span class="timestamp">{{message.created_at | date:'MMM d, h:mm a'}}</span>
                </div>
                <div class="message-content">{{message.message}}</div>
              </div>
            </div>

            <div *ngIf="messages.length === 0" class="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>

            <!-- Customer/Public Message Form -->
            <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="message-form">
              <div class="form-group">
                <label>{{getMessageFormLabel()}}</label>
                <textarea 
                  formControlName="message" 
                  placeholder="Type your message here..."
                  rows="3"></textarea>
              </div>
              <button type="submit" [disabled]="messageForm.invalid || sending" class="btn-primary">
                {{sending ? 'Sending...' : 'Send Message'}}
              </button>
            </form>

            <!-- Internal Notes Form (Agents/Admins only) -->
            <form *ngIf="canAddInternalNotes()" [formGroup]="internalNoteForm" (ngSubmit)="addInternalNote()" class="internal-note-form">
              <div class="form-group">
                <label>Internal Note (only visible to agents/admins):</label>
                <textarea 
                  formControlName="note" 
                  placeholder="Add internal note for team members..."
                  rows="2"></textarea>
              </div>
              <button type="submit" [disabled]="internalNoteForm.invalid || sendingNote" class="btn-secondary">
                {{sendingNote ? 'Adding...' : 'Add Internal Note'}}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading">Loading ticket details...</div>
    <div *ngIf="error" class="error">{{error}}</div>
  `,
  styles: [`
    .ticket-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }
    .ticket-header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .breadcrumb-link {
      color: #007bff;
      text-decoration: none;
    }
    .breadcrumb-separator {
      margin: 0 0.5rem;
      color: #666;
    }
    .breadcrumb-current {
      color: #666;
    }
    .ticket-info h1 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .ticket-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .priority, .status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .priority-low { background-color: #d4edda; color: #155724; }
    .priority-medium { background-color: #fff3cd; color: #856404; }
    .priority-high { background-color: #f8d7da; color: #721c24; }
    .status-open { background-color: #cce5ff; color: #004085; }
    .status-in_progress { background-color: #fff3cd; color: #856404; }
    .status-resolved { background-color: #d4edda; color: #155724; }
    .ticket-id {
      color: #666;
      font-size: 0.875rem;
    }
    .ticket-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .detail-card, .messages-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .detail-card h3, .messages-card h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }
    .detail-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
    }
    .detail-item label {
      font-weight: 500;
      color: #666;
    }
    .description label {
      display: block;
      font-weight: 500;
      color: #666;
      margin-bottom: 0.5rem;
    }
    .description p {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin: 0;
      line-height: 1.5;
    }
    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 1.5rem;
    }
    .message {
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
    }
    .message.own-message {
      background: #e3f2fd;
      margin-left: 2rem;
    }
    .message.internal-note {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      position: relative;
    }
    .message.internal-note.own-message {
      background: #fff8e1;
    }
    .message-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .sender {
      font-weight: 500;
    }
    .role-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
    }
    .role-customer { background-color: #e3f2fd; color: #1976d2; }
    .role-agent { background-color: #fff3e0; color: #f57c00; }
    .role-admin { background-color: #fce4ec; color: #c2185b; }
    .internal-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      background-color: #ff9800;
      color: white;
      font-weight: bold;
    }
    .timestamp {
      color: #666;
      margin-left: auto;
    }
    .message-content {
      line-height: 1.4;
    }
    .no-messages {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
    .message-form {
      border-top: 1px solid #e9ecef;
      padding-top: 1.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      box-sizing: border-box;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .btn-secondary {
      background-color: #6c757d;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-secondary:disabled {
      background-color: #adb5bd;
      cursor: not-allowed;
    }
    .status-update-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    .status-update-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .status-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .status-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn-update-status {
      background-color: #ffc107;
      color: #212529;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-update-status:disabled {
      background-color: #6c757d;
      color: white;
      cursor: not-allowed;
    }
    .internal-note-form {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }
    .internal-note-form label {
      color: #856404;
      font-weight: 500;
    }
    .loading, .error {
      text-align: center;
      padding: 3rem;
    }
    .error {
      color: #dc3545;
    }
    @media (max-width: 768px) {
      .ticket-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  ticket: Ticket | null = null;
  messages: TicketMessage[] = [];
  messageForm: FormGroup;
  internalNoteForm: FormGroup;
  loading = true;
  sending = false;
  sendingNote = false;
  updatingStatus = false;
  error = '';
  currentUserId: number = 0;
  currentUser: User | null = null;
  selectedStatus: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' = 'open';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService,
    private socketService: SocketService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
    
    this.internalNoteForm = this.fb.group({
      note: ['', Validators.required]
    });

    this.currentUser = this.authService.getCurrentUser();
    this.currentUserId = this.currentUser?.id || 0;
  }

  ngOnInit(): void {
    const ticketId = this.route.snapshot.params['id'];
    this.loadTicket(ticketId);
    this.initializeRealTimeChat(ticketId);
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  initializeRealTimeChat(ticketId: number): void {
    const token = this.authService.getToken();
    if (token) {
      this.socketService.connect(token);
      this.socketService.joinTicket(ticketId);
      
      // Listen for new messages
      this.socketService.onNewMessage().subscribe(message => {
        this.messages.push(message);
      });
      
      // Listen for status updates
      this.socketService.onStatusUpdate().subscribe(data => {
        if (this.ticket && data.ticketId == this.ticket.id) {
          this.ticket.status = data.status as any;
          this.selectedStatus = data.status as any;
        }
      });
    }
  }

  loadTicket(ticketId: number): void {
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (response) => {
        this.ticket = response.ticket;
        this.messages = response.messages || [];
        this.selectedStatus = this.ticket?.status || 'open';
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load ticket';
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.ticket) {
      this.sending = true;
      const message = this.messageForm.get('message')?.value;

      // Try Socket.IO first, fallback to HTTP
      this.socketService.sendMessage(this.ticket.id, message, false);
      
      // Fallback to HTTP if socket not connected
      this.ticketService.addMessage(this.ticket.id, message).subscribe({
        next: () => {
          this.messageForm.reset();
          this.sending = false;
          // Reload messages if socket failed
          if (!this.socketService.isConnected()) {
            this.loadTicket(this.ticket!.id);
          }
        },
        error: (error) => {
          console.error('Failed to send message:', error);
          this.sending = false;
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'on_hold': 'On Hold',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return labels[status] || status;
  }

  canUpdateStatus(): boolean {
    if (!this.ticket || !this.currentUser) return false;
    
    // Assigned agent, admin, or customer can update status
    return this.ticket.assigned_agent_id === this.currentUserId ||
           this.currentUser.role === 'admin' ||
           this.ticket.customer_id === this.currentUserId;
  }

  canAddInternalNotes(): boolean {
    return this.currentUser?.role === 'agent' || this.currentUser?.role === 'admin';
  }

  updateStatus(): void {
    if (!this.ticket || !this.selectedStatus || this.selectedStatus === this.ticket.status) return;

    this.updatingStatus = true;
    
    // Try Socket.IO first, fallback to HTTP
    this.socketService.updateStatus(this.ticket.id, this.selectedStatus);
    
    // Fallback to HTTP
    this.ticketService.updateTicketStatus(this.ticket.id, this.selectedStatus).subscribe({
      next: (response) => {
        if (this.ticket) {
          this.ticket.status = this.selectedStatus as any;
        }
        this.updatingStatus = false;
      },
      error: (error) => {
        console.error('Failed to update status:', error);
        this.updatingStatus = false;
      }
    });
  }

  addInternalNote(): void {
    if (this.internalNoteForm.valid && this.ticket) {
      this.sendingNote = true;
      const note = this.internalNoteForm.get('note')?.value;

      // Try Socket.IO first, fallback to HTTP
      this.socketService.sendMessage(this.ticket.id, note, true);
      
      // Fallback to HTTP
      this.ticketService.addInternalNote(this.ticket.id, note).subscribe({
        next: () => {
          this.internalNoteForm.reset();
          this.sendingNote = false;
          // Reload if socket failed
          if (!this.socketService.isConnected()) {
            this.loadTicket(this.ticket!.id);
          }
        },
        error: (error) => {
          console.error('Failed to add internal note:', error);
          this.sendingNote = false;
        }
      });
    }
  }

  getMessageFormLabel(): string {
    return this.currentUser?.role === 'customer' ? 'Share Message' : 'Public Message (visible to customer):';
  }
}