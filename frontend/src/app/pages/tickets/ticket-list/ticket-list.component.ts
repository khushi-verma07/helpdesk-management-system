import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="ticket-list-container">
      <nav class="breadcrumb">
        <a routerLink="/dashboard" class="breadcrumb-link">🏠 Dashboard</a>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">My Tickets</span>
      </nav>
      
      <div class="header">
        <h2>My Tickets</h2>
        <button routerLink="/tickets/create" class="btn-primary">Create New Ticket</button>
      </div>

      <div *ngIf="loading" class="loading">Loading tickets...</div>

      <div *ngIf="!loading && tickets.length === 0" class="no-tickets">
        <div class="empty-state">
          <h3>No tickets found</h3>
          <p>You haven't created any support tickets yet.</p>
          <button routerLink="/tickets/create" class="btn-primary">Create Your First Ticket</button>
        </div>
      </div>

      <div class="tickets-grid" *ngIf="!loading && tickets.length > 0">
        <div *ngFor="let ticket of tickets" class="ticket-card" [routerLink]="['/tickets', ticket.id]">
          <div class="ticket-header">
            <h3>{{ticket.title}}</h3>
            <span class="priority" [class]="'priority-' + ticket.priority">{{ticket.priority | uppercase}}</span>
          </div>
          
          <p class="ticket-description">{{getShortDescription(ticket.description)}}</p>
          
          <div class="ticket-meta">
            <span class="category" *ngIf="ticket.category">{{ticket.category}}</span>
            <span class="sla-deadline">Due: {{ticket.sla_deadline | date:'MMM d, h:mm a'}}</span>
          </div>
          
          <div class="ticket-footer">
            <span class="status" [class]="'status-' + ticket.status">{{getStatusLabel(ticket.status)}}</span>
            <span class="date">{{ticket.created_at | date:'MMM d, yyyy'}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ticket-list-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
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
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
      display: inline-block;
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
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
    }
    .ticket-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .ticket-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
      flex: 1;
      margin-right: 1rem;
    }
    .priority {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
      white-space: nowrap;
    }
    .priority-low { 
      background-color: #d4edda; 
      color: #155724; 
      border-left-color: #28a745;
    }
    .priority-medium { 
      background-color: #fff3cd; 
      color: #856404; 
      border-left-color: #ffc107;
    }
    .priority-high { 
      background-color: #f8d7da; 
      color: #721c24; 
      border-left-color: #dc3545;
    }
    .ticket-description {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    .ticket-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .category {
      background-color: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: #495057;
    }
    .sla-deadline {
      color: #666;
    }
    .ticket-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }
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
    .date {
      color: #666;
      font-size: 0.875rem;
    }
  `]
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = true;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getMyTickets().subscribe({
      next: (response) => {
        this.tickets = response.tickets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load tickets:', error);
        this.loading = false;
      }
    });
  }

  getShortDescription(description: string): string {
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
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
}