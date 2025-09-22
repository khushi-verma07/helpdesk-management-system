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
    <div class="p-8 max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <button routerLink="/dashboard" class="text-slate-600 hover:text-slate-800 text-lg">←</button>
          <h2 class="text-2xl font-bold">Unassigned Tickets</h2>
        </div>
        <div class="flex gap-4">
          <span class="bg-gray-100 px-4 py-2 rounded font-medium">{{tickets.length}} unassigned tickets</span>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-12 text-gray-600">Loading unassigned tickets...</div>

      <div *ngIf="!loading && tickets.length === 0" class="text-center py-12">
        <div>
          <h3 class="text-gray-600 mb-4">No unassigned tickets</h3>
          <p class="text-gray-500">All tickets have been assigned to agents.</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg overflow-hidden" *ngIf="!loading && tickets.length > 0">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Ticket #</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Title</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Customer</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Priority</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Created</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">SLA Deadline</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Assign To</th>
              <th class="px-4 py-4 text-left font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ticket of tickets" class="border-b border-gray-200">
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
              <td class="px-4 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" 
                      [ngClass]="{
                        'bg-green-100 text-green-800': ticket.priority === 'low',
                        'bg-yellow-100 text-yellow-800': ticket.priority === 'medium',
                        'bg-red-100 text-red-800': ticket.priority === 'high'
                      }">{{ticket.priority | uppercase}}</span>
              </td>
              <td class="px-4 py-4 text-sm">{{ticket.created_at | date:'MMM d, h:mm a'}}</td>
              <td class="px-4 py-4 text-sm" [class.text-red-600]="isOverdue(ticket.sla_deadline)" [class.font-medium]="isOverdue(ticket.sla_deadline)">
                {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
              </td>
              <td class="px-4 py-4">
                <select [(ngModel)]="ticket.selectedAgentId" class="w-full px-2 py-1 border border-gray-300 rounded">
                  <option value="">Select Agent</option>
                  <option *ngFor="let agent of agents" [value]="agent.id">
                    {{agent.first_name}} {{agent.last_name}}
                  </option>
                </select>
              </td>
              <td class="px-4 py-4">
                <button 
                  (click)="assignTicket(ticket)" 
                  [disabled]="!ticket.selectedAgentId || assigning === ticket.id"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-4 py-2 rounded text-sm">
                  {{assigning === ticket.id ? 'Assigning...' : 'Assign'}}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="message" class="mt-4 p-4 rounded" [ngClass]="isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">{{message}}</div>
    </div>
  `,
  styles: []
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