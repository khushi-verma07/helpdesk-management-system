import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';

interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

@Component({
  selector: 'app-unassigned-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="unassigned-tickets-container">
      <div class="header">
        <h2>Unassigned Tickets</h2>
        <div class="stats">
          <span class="stat-item">{{tickets.length}} unassigned tickets</span>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading unassigned tickets...</div>

      <div *ngIf="!loading && tickets.length === 0" class="no-tickets">
        <div class="empty-state">
          <h3>No unassigned tickets</h3>
          <p>All tickets have been assigned to agents.</p>
        </div>
      </div>

      <div class="tickets-table" *ngIf="!loading && tickets.length > 0">
        <table>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Priority</th>
              <th>Created</th>
              <th>SLA Deadline</th>
              <th>Assign To</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ticket of tickets">
              <td>
                <a [routerLink]="['/tickets', ticket.id]" class="ticket-link">#{{ticket.id}}</a>
              </td>
              <td>
                <div class="ticket-title">{{ticket.title}}</div>
                <div class="ticket-category" *ngIf="ticket.category">{{ticket.category}}</div>
              </td>
              <td>
                <div class="customer-info">
                  <div>{{ticket.customer_first_name}} {{ticket.customer_last_name}}</div>
                  <div class="customer-email">{{ticket.customer_email}}</div>
                </div>
              </td>
              <td>
                <span class="priority" [class]="'priority-' + ticket.priority">{{ticket.priority | uppercase}}</span>
              </td>
              <td>{{ticket.created_at | date:'MMM d, h:mm a'}}</td>
              <td>
                <span class="sla-deadline" [class.overdue]="isOverdue(ticket.sla_deadline)">
                  {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
                </span>
              </td>
              <td>
                <select [(ngModel)]="ticket.selectedAgentId" class="agent-select">
                  <option value="">Select Agent</option>
                  <option *ngFor="let agent of agents" [value]="agent.id">
                    {{agent.first_name}} {{agent.last_name}}
                  </option>
                </select>
              </td>
              <td>
                <button 
                  (click)="assignTicket(ticket)" 
                  [disabled]="!ticket.selectedAgentId || assigning === ticket.id"
                  class="btn-assign">
                  {{assigning === ticket.id ? 'Assigning...' : 'Assign'}}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="message" class="message" [class.error]="isError">{{message}}</div>
    </div>
  `,
  styles: [`
    .unassigned-tickets-container {
      padding: 2rem;
      max-width: 1400px;
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
    .tickets-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }
    .ticket-link {
      color: #007bff;
      text-decoration: none;
      font-weight: 500;
    }
    .ticket-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .ticket-category {
      font-size: 0.875rem;
      color: #666;
      background: #f8f9fa;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
    .customer-info {
      font-size: 0.875rem;
    }
    .customer-email {
      color: #666;
    }
    .priority {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .priority-low { background-color: #d4edda; color: #155724; }
    .priority-medium { background-color: #fff3cd; color: #856404; }
    .priority-high { background-color: #f8d7da; color: #721c24; }
    .sla-deadline {
      font-size: 0.875rem;
    }
    .sla-deadline.overdue {
      color: #dc3545;
      font-weight: 500;
    }
    .agent-select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn-assign {
      background-color: #28a745;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .btn-assign:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .message {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 4px;
      background-color: #d4edda;
      color: #155724;
    }
    .message.error {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class UnassignedTicketsComponent implements OnInit, OnDestroy {
  tickets: (Ticket & { selectedAgentId?: number })[] = [];
  agents: Agent[] = [];
  loading = true;
  assigning: number | null = null;
  message = '';
  isError = false;
  private refreshInterval: any;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadData();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadData(): void {
    Promise.all([
      this.ticketService.getUnassignedTickets().toPromise(),
      this.ticketService.getAgents().toPromise()
    ]).then(([ticketsResponse, agentsResponse]) => {
      this.tickets = ticketsResponse.tickets;
      this.agents = agentsResponse.agents;
      this.loading = false;
    }).catch(error => {
      console.error('Failed to load data:', error);
      this.loading = false;
    });
  }

  assignTicket(ticket: Ticket & { selectedAgentId?: number }): void {
    if (!ticket.selectedAgentId) return;

    this.assigning = ticket.id;
    this.message = '';

    this.ticketService.assignTicket(ticket.id, ticket.selectedAgentId).subscribe({
      next: (response) => {
        this.message = `Ticket #${ticket.id} assigned successfully`;
        this.isError = false;
        this.assigning = null;
        
        // Remove ticket from unassigned list
        this.tickets = this.tickets.filter(t => t.id !== ticket.id);
        
        // Clear message after 3 seconds
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        this.message = error.error?.message || 'Failed to assign ticket';
        this.isError = true;
        this.assigning = null;
      }
    });
  }

  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }
}