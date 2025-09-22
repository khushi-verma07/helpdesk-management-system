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
    <div class="p-8 max-w-7xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button routerLink="/dashboard" class="text-slate-600 hover:text-slate-800 text-lg">←</button>
          <h2 class="text-2xl font-bold">All Tickets</h2>
        </div>
        <div class="flex justify-between items-center">
          <div class="flex gap-4">
            <span class="bg-gray-100 px-4 py-2 rounded font-medium">{{tickets.length}} total tickets</span>
            <span class="bg-gray-100 px-4 py-2 rounded font-medium">{{getUnassignedCount()}} unassigned</span>
            <span class="bg-gray-100 px-4 py-2 rounded font-medium">{{getOpenCount()}} open</span>
            <span *ngIf="getOverdueCount() > 0" class="bg-red-100 text-red-800 px-4 py-2 rounded font-bold">{{getOverdueCount()}} overdue</span>
          </div>
          <button (click)="refreshTickets()" [disabled]="loading" class="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-4 py-2 rounded ml-4">
            {{loading ? 'Refreshing...' : 'Refresh'}}
          </button>
        </div>
      </div>

      <div class="flex gap-4 mb-8">
        <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="px-2 py-1 border border-gray-300 rounded">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        
        <select [(ngModel)]="priorityFilter" (change)="applyFilters()" class="px-2 py-1 border border-gray-300 rounded">
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select [(ngModel)]="overdueFilter" (change)="applyFilters()" class="px-2 py-1 border border-gray-300 rounded">
          <option value="">All Tickets</option>
          <option value="overdue">Overdue Only</option>
        </select>
      </div>

      <div *ngIf="loading" class="text-center py-12 text-gray-600">Loading all tickets...</div>

      <div class="bg-white rounded-lg shadow-lg overflow-hidden" *ngIf="!loading && filteredTickets.length > 0">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Ticket #</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Title</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Customer</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Assigned Agent</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Priority</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Created</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">SLA Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ticket of filteredTickets" class="border-b border-gray-200">
              <td class="px-4 py-4">
                <a [routerLink]="['/tickets', ticket.id]" class="text-blue-600 hover:text-blue-800 font-medium">#{{ticket.id}}</a>
              </td>
              <td class="px-4 py-4">
                <div class="font-medium mb-1">{{ticket.title}}</div>
                <div *ngIf="ticket.category" class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{{ticket.category}}</div>
              </td>
              <td class="px-4 py-4 text-sm">
                <div>{{ticket.customer_first_name}} {{ticket.customer_last_name}}</div>
                <div class="text-gray-600">{{ticket.customer_email}}</div>
              </td>
              <td class="px-4 py-4 text-sm">
                <div *ngIf="ticket.agent_first_name">
                  {{ticket.agent_first_name}} {{ticket.agent_last_name}}
                </div>
                <span *ngIf="!ticket.agent_first_name" class="text-red-600 italic">Unassigned</span>
              </td>
              <td class="px-4 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" 
                      [ngClass]="{
                        'bg-green-100 text-green-800': ticket.priority === 'low',
                        'bg-yellow-100 text-yellow-800': ticket.priority === 'medium',
                        'bg-red-100 text-red-800': ticket.priority === 'high'
                      }">{{ticket.priority | uppercase}}</span>
              </td>
              <td class="px-4 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': ticket.status === 'open',
                        'bg-yellow-100 text-yellow-800': ticket.status === 'in_progress',
                        'bg-red-100 text-red-800': ticket.status === 'on_hold',
                        'bg-green-100 text-green-800': ticket.status === 'resolved',
                        'bg-gray-100 text-gray-800': ticket.status === 'closed'
                      }">{{getStatusLabel(ticket.status)}}</span>
              </td>
              <td class="px-4 py-4 text-sm">{{ticket.created_at | date:'MMM d, h:mm a'}}</td>
              <td class="px-4 py-4 text-sm" [class.text-red-600]="isTicketOverdue(ticket)" [class.font-medium]="isTicketOverdue(ticket)">
                {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && filteredTickets.length === 0" class="text-center py-12 text-gray-600">
        <p>No tickets found matching the current filters.</p>
      </div>
    </div>
  `,
  styles: []
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