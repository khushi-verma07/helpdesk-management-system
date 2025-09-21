import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-assigned-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="assigned-tickets-container">
      <div class="header">
        <h2>My Assigned Tickets</h2>
        <div class="stats">
          <span class="stat-item">{{tickets.length}} assigned tickets</span>
          <span class="stat-item">{{getHighPriorityCount()}} high priority</span>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading your assigned tickets...</div>

      <div *ngIf="!loading && tickets.length === 0" class="no-tickets">
        <div class="empty-state">
          <h3>No tickets assigned</h3>
          <p>You don't have any tickets assigned to you yet.</p>
        </div>
      </div>

      <div class="tickets-grid" *ngIf="!loading && tickets.length > 0">
        <div *ngFor="let ticket of tickets" class="ticket-card" [routerLink]="['/tickets', ticket.id]">
          <div class="ticket-header">
            <div class="ticket-info">
              <h3>{{ticket.title}}</h3>
              <span class="ticket-id">#{{ticket.id}}</span>
            </div>
            <div class="ticket-badges">
              <span class="priority" [class]="'priority-' + ticket.priority">{{ticket.priority | uppercase}}</span>
              <span class="status" [class]="'status-' + ticket.status">{{getStatusLabel(ticket.status)}}</span>
            </div>
          </div>
          
          <p class="ticket-description">{{getShortDescription(ticket.description)}}</p>
          
          <div class="customer-info">
            <strong>Customer:</strong> {{ticket.customer_first_name}} {{ticket.customer_last_name}}
            <br>
            <span class="customer-email">{{ticket.customer_email}}</span>
          </div>
          
          <div class="ticket-meta">
            <div class="meta-item">
              <span class="label">Created:</span>
              <span>{{ticket.created_at | date:'MMM d, h:mm a'}}</span>
            </div>
            <div class="meta-item">
              <span class="label">SLA Deadline:</span>
              <span [class.overdue]="isOverdue(ticket.sla_deadline)">
                {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
              </span>
            </div>
            <div class="meta-item" *ngIf="ticket.category">
              <span class="label">Category:</span>
              <span>{{ticket.category}}</span>
            </div>
          </div>
          
          <div class="ticket-actions">
            <button class="btn-view">View Details</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assigned-tickets-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .stats {
      display: flex;
      gap: 1rem;
    }
    .stat-item {
      background: #f8f9fa;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
    }
    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    .no-tickets {
      text-align: center;
      padding: 3rem;
    }
    .empty-state h3 {
      color: #666;
      margin-bottom: 1rem;
    }
    .tickets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .ticket-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 4px solid #e9ecef;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .ticket-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .ticket-card.priority-high {
      border-left-color: #dc3545;
    }
    .ticket-card.priority-medium {
      border-left-color: #ffc107;
    }
    .ticket-card.priority-low {
      border-left-color: #28a745;
    }
    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .ticket-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #333;
    }
    .ticket-id {
      color: #666;
      font-size: 0.875rem;
    }
    .ticket-badges {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-end;
    }
    .priority, .status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
      white-space: nowrap;
    }
    .priority-low { background-color: #d4edda; color: #155724; }
    .priority-medium { background-color: #fff3cd; color: #856404; }
    .priority-high { background-color: #f8d7da; color: #721c24; }
    .status-open { background-color: #cce5ff; color: #004085; }
    .status-in_progress { background-color: #fff3cd; color: #856404; }
    .status-on_hold { background-color: #f8d7da; color: #721c24; }
    .status-resolved { background-color: #d4edda; color: #155724; }
    .ticket-description {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    .customer-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .customer-email {
      color: #666;
    }
    .ticket-meta {
      margin-bottom: 1rem;
    }
    .meta-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .label {
      font-weight: 500;
      color: #666;
    }
    .overdue {
      color: #dc3545;
      font-weight: 500;
    }
    .ticket-actions {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
    }
    .btn-view {
      background-color: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
  `]
})
export class AssignedTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = true;

  constructor(private ticketService: TicketService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current logged in user:', currentUser);
    this.loadTickets();
  }

  loadTickets(): void {
    console.log('Loading assigned tickets...');
    this.ticketService.getAssignedTickets().subscribe({
      next: (response) => {
        console.log('Assigned tickets response:', response);
        this.tickets = response.tickets;
        console.log('Tickets array:', this.tickets);
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load assigned tickets:', error);
        this.loading = false;
      }
    });
  }

  getShortDescription(description: string): string {
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
  }

  getHighPriorityCount(): number {
    return this.tickets.filter(t => t.priority === 'high').length;
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

  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }
}