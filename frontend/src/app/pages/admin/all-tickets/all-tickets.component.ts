import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-all-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="all-tickets-container">
      <div class="header">
        <h2>All Tickets</h2>
        <div class="header-actions">
          <div class="stats">
            <span class="stat-item">{{tickets.length}} total tickets</span>
            <span class="stat-item">{{getUnassignedCount()}} unassigned</span>
            <span class="stat-item">{{getOpenCount()}} open</span>
            <span class="stat-item overdue" *ngIf="getOverdueCount() > 0">{{getOverdueCount()}} overdue</span>
          </div>
          <button (click)="refreshTickets()" [disabled]="loading" class="refresh-btn">
            {{loading ? 'Refreshing...' : 'Refresh'}}
          </button>
        </div>
      </div>

      <div class="filters">
        <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        
        <select [(ngModel)]="priorityFilter" (change)="applyFilters()" class="filter-select">
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select [(ngModel)]="overdueFilter" (change)="applyFilters()" class="filter-select">
          <option value="">All Tickets</option>
          <option value="overdue">Overdue Only</option>
        </select>
      </div>

      <div *ngIf="loading" class="loading">Loading all tickets...</div>

      <div class="tickets-table" *ngIf="!loading && filteredTickets.length > 0">
        <table>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Assigned Agent</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>SLA Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ticket of filteredTickets">
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
                <div *ngIf="ticket.agent_first_name" class="agent-info">
                  {{ticket.agent_first_name}} {{ticket.agent_last_name}}
                </div>
                <span *ngIf="!ticket.agent_first_name" class="unassigned">Unassigned</span>
              </td>
              <td>
                <span class="priority" [class]="'priority-' + ticket.priority">{{ticket.priority | uppercase}}</span>
              </td>
              <td>
                <span class="status" [class]="'status-' + ticket.status">{{getStatusLabel(ticket.status)}}</span>
              </td>
              <td>{{ticket.created_at | date:'MMM d, h:mm a'}}</td>
              <td>
                <span class="sla-deadline" [class.overdue]="isTicketOverdue(ticket)">
                  {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && filteredTickets.length === 0" class="no-tickets">
        <p>No tickets found matching the current filters.</p>
      </div>
    </div>
  `,
  styles: [`
    .all-tickets-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 2rem;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .refresh-btn {
      background-color: #28a745;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 1rem;
    }
    .refresh-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
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
    .stat-item.overdue {
      background: #f8d7da;
      color: #721c24;
      font-weight: bold;
    }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .filter-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
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
    .customer-info, .agent-info {
      font-size: 0.875rem;
    }
    .customer-email {
      color: #666;
    }
    .unassigned {
      color: #dc3545;
      font-style: italic;
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
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .status-open { background-color: #cce5ff; color: #004085; }
    .status-in_progress { background-color: #fff3cd; color: #856404; }
    .status-on_hold { background-color: #f8d7da; color: #721c24; }
    .status-resolved { background-color: #d4edda; color: #155724; }
    .status-closed { background-color: #e2e3e5; color: #383d41; }
    .sla-deadline {
      font-size: 0.875rem;
    }
    .sla-deadline.overdue {
      color: #dc3545;
      font-weight: 500;
    }
    .no-tickets {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class AllTicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  loading = true;
  statusFilter = '';
  priorityFilter = '';
  overdueFilter = '';
  private refreshInterval: any;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
    this.refreshInterval = setInterval(() => {
      this.loadTickets();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadTickets(): void {
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.filteredTickets = this.tickets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load tickets:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const statusMatch = !this.statusFilter || ticket.status === this.statusFilter;
      const priorityMatch = !this.priorityFilter || ticket.priority === this.priorityFilter;
      const overdueMatch = !this.overdueFilter || (this.overdueFilter === 'overdue' && this.isTicketOverdue(ticket));
      return statusMatch && priorityMatch && overdueMatch;
    });
  }

  getUnassignedCount(): number {
    return this.tickets.filter(t => !t.assigned_agent_id).length;
  }

  getOpenCount(): number {
    return this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  }

  getOverdueCount(): number {
    return this.tickets.filter(t => this.isTicketOverdue(t)).length;
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

  refreshTickets(): void {
    this.loading = true;
    this.loadTickets();
  }

  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }

  isTicketOverdue(ticket: any): boolean {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return false;
    }
    return this.isOverdue(ticket.sla_deadline);
  }
}