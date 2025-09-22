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
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col" *ngIf="ticket">
      <!-- Mobile-first Header -->
      <header class="bg-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg flex-shrink-0 border-b border-gray-200">
        <div class="flex items-center justify-between mb-2 sm:mb-0">
          <!-- Breadcrumb - Hidden on mobile, shown on sm+ -->
          <div class="hidden sm:flex items-center space-x-2 text-xs lg:text-sm">
            <a routerLink="/dashboard" class="text-slate-600 hover:text-slate-800 transition-colors">🏠 Dashboard</a>
            <span class="text-slate-400">></span>
            <a *ngIf="currentUser?.role === 'customer'" routerLink="/tickets/my" class="text-slate-600 hover:text-slate-800 transition-colors">My Tickets</a>
            <a *ngIf="currentUser?.role === 'agent'" routerLink="/tickets/assigned" class="text-slate-600 hover:text-slate-800 transition-colors">Assigned Tickets</a>
            <span class="text-slate-400">></span>
            <span class="text-slate-800 font-medium">Ticket #{{ticket.id}}</span>
          </div>
          <!-- Mobile back button -->
          <button *ngIf="currentUser?.role === 'customer'" routerLink="/tickets/my" class="sm:hidden text-slate-600 hover:text-slate-800 text-sm">← Back</button>
          <button *ngIf="currentUser?.role === 'agent'" routerLink="/tickets/assigned" class="sm:hidden text-slate-600 hover:text-slate-800 text-sm">← Back</button>
        </div>
        <div class="">
          <h1 class="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1 sm:mb-2">{{ticket.title}}</h1>
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="getPriorityClass(ticket.priority)">{{ticket.priority | uppercase}}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="getStatusClass(ticket.status)">{{getStatusLabel(ticket.status)}}</span>
            <span class="text-slate-600 text-xs">#{{ticket.id}}</span>
          </div>
        </div>
      </header>

      <!-- Main Content - Mobile-first Layout -->
      <div class="flex-1 p-2 sm:p-3 lg:p-4 max-w-7xl mx-auto w-full overflow-hidden">
        <!-- Mobile: Stack vertically, Desktop: Side by side -->
        <div class="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4 h-full">
          
          <!-- Ticket Details - Full width on mobile, sidebar on desktop -->
          <div class="lg:col-span-1 order-2 lg:order-1">
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 sm:p-4 h-auto lg:h-full overflow-y-auto">
              <h3 class="font-semibold text-slate-800 mb-3 text-sm lg:text-base">Ticket Details</h3>
              
              <!-- Details Grid - 2 columns on mobile, 1 on desktop -->
              <div class="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-1 text-xs sm:text-sm mb-4">
                <div class="lg:flex lg:justify-between">
                  <span class="text-gray-500 block lg:inline">Created:</span>
                  <span class="text-gray-800 font-medium lg:font-normal">{{ticket.created_at | date:'MMM d, h:mm a'}}</span>
                </div>
                <div class="lg:flex lg:justify-between">
                  <span class="text-gray-500 block lg:inline">SLA Deadline:</span>
                  <span class="text-gray-800 font-medium lg:font-normal">{{ticket.sla_deadline | date:'MMM d, h:mm a'}}</span>
                </div>
                <div class="lg:flex lg:justify-between" *ngIf="ticket.category">
                  <span class="text-gray-500 block lg:inline">Category:</span>
                  <span class="text-gray-800 font-medium lg:font-normal">{{ticket.category}}</span>
                </div>
                <div class="lg:flex lg:justify-between" *ngIf="ticket.agent_first_name">
                  <span class="text-gray-500 block lg:inline">Agent:</span>
                  <span class="text-gray-800 font-medium lg:font-normal">{{ticket.agent_first_name}} {{ticket.agent_last_name}}</span>
                </div>
              </div>
              
              <!-- Status Update Section -->
              <div *ngIf="canUpdateStatus()" class="mb-4 pt-3 border-t border-gray-200">
                <h4 class="font-medium text-slate-800 mb-2 text-sm">Update Status</h4>
                <div class="space-y-2">
                  <select [(ngModel)]="selectedStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button (click)="updateStatus()" [disabled]="updatingStatus || selectedStatus === ticket.status" 
                          class="w-full border-2 border-slate-600 bg-transparent text-slate-800 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 hover:!text-white hover:border-transparent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-800 disabled:hover:border-slate-600 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-200">
                    {{updatingStatus ? 'Updating...' : 'Update Status'}}
                  </button>
                </div>
              </div>
              
              <!-- Description -->
              <div class="pt-3 border-t border-gray-200">
                <h4 class="font-medium text-slate-800 mb-2 text-sm">Description</h4>
                <p class="text-gray-600 text-sm leading-relaxed">{{ticket.description}}</p>
              </div>
            </div>
          </div>

          <!-- Messages Section - Full width on mobile, main content on desktop -->
          <div class="lg:col-span-2 order-1 lg:order-2 flex-1 lg:flex-none">
            <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 h-96 sm:h-[500px] lg:h-full flex flex-col">
              <div class="p-3 sm:p-4 border-b border-gray-200/50 flex-shrink-0">
                <h3 class="font-semibold text-slate-800 text-sm lg:text-base">Messages</h3>
              </div>
              
              <!-- Messages List -->
              <div class="flex-1 p-3 sm:p-4 overflow-y-auto" *ngIf="messages.length > 0">
                <div class="space-y-3">
                  <div *ngFor="let message of messages" class="p-3 rounded-lg" 
                       [ngClass]="message.sender_id === currentUserId ? 'bg-gradient-to-r from-emerald-50 to-teal-50 ml-0 sm:ml-8 lg:ml-12 border border-emerald-200/50' : 'bg-gray-50/80 mr-0 sm:mr-8 lg:mr-12 border border-gray-200/50'">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                      <div class="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span class="font-medium text-gray-800 text-sm">{{message.first_name}} {{message.last_name}}</span>
                        <span class="px-2 py-0.5 rounded text-xs" [ngClass]="getRoleClass(message.role)">{{message.role}}</span>
                        <span *ngIf="message.is_internal" class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Internal</span>
                      </div>
                      <span class="text-gray-500 text-xs sm:text-sm">{{message.created_at | date:'MMM d, h:mm a'}}</span>
                    </div>
                    <div class="text-gray-700 text-sm leading-relaxed">{{message.message}}</div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="messages.length === 0" class="flex-1 flex items-center justify-center p-4">
                <div class="text-center">
                  <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="text-lg">💬</span>
                  </div>
                  <p class="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                </div>
              </div>

              <!-- Message Forms -->
              <div class="p-3 sm:p-4 border-t border-gray-200/50 space-y-3 flex-shrink-0">
                <!-- Public Message Form -->
                <form [formGroup]="messageForm" (ngSubmit)="sendMessage()">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">{{getMessageFormLabel()}}</label>
                    <textarea 
                      formControlName="message" 
                      placeholder="Type your message here..."
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 resize-none"></textarea>
                    <button type="submit" [disabled]="messageForm.invalid || sending" 
                            class="w-full sm:w-auto border-2 border-slate-600 bg-transparent text-slate-800 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 hover:!text-white hover:border-transparent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-800 disabled:hover:border-slate-600 px-4 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-200">
                      {{sending ? 'Sending...' : 'Send Message'}}
                    </button>
                  </div>
                </form>

                <!-- Internal Notes Form -->
                <form *ngIf="canAddInternalNotes()" [formGroup]="internalNoteForm" (ngSubmit)="addInternalNote()" class="pt-3 border-t border-gray-200">
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-gray-700">Internal Note (team only)</label>
                    <textarea 
                      formControlName="note" 
                      placeholder="Add internal note for team members..."
                      rows="2"
                      class="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/80"></textarea>
                    <button type="submit" [disabled]="internalNoteForm.invalid || sendingNote" 
                            class="border-2 border-slate-600 bg-transparent text-slate-800 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 hover:!text-white hover:border-transparent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-800 disabled:hover:border-slate-600 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200">
                      {{sendingNote ? 'Adding...' : 'Add Internal Note'}}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
      <div class="flex items-center space-x-2 text-emerald-600">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs">Loading ticket details...</span>
      </div>
    </div>
    
    <div *ngIf="error" class="h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
      <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-4 max-w-sm">
        <div class="text-center">
          <div class="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span class="text-white text-sm">⚠️</span>
          </div>
          <h3 class="text-sm font-semibold text-red-600 mb-1">Error</h3>
          <p class="text-red-600 text-xs">{{error}}</p>
        </div>
      </div>
    </div>
  `,
  styles: []
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

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'open': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'on_hold': 'bg-orange-100 text-orange-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      'customer': 'bg-blue-100 text-blue-800',
      'agent': 'bg-purple-100 text-purple-800',
      'admin': 'bg-pink-100 text-pink-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }
}