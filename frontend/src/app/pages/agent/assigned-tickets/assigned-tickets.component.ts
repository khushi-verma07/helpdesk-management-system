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
    <div class="p-8 max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <button routerLink="/dashboard" class="text-slate-600 hover:text-slate-800 text-lg">←</button>
          <h2 class="text-2xl font-bold text-slate-800">My Assigned Tickets</h2>
        </div>
        <div class="flex gap-4">
          <span class="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium">{{tickets.length}} assigned tickets</span>
          <span class="bg-gradient-to-r from-amber-100 to-orange-200 text-amber-700 px-4 py-2 rounded-lg font-medium">{{getHighPriorityCount()}} high priority</span>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-12 text-slate-600">Loading your assigned tickets...</div>

      <div *ngIf="!loading && tickets.length === 0" class="text-center py-12">
        <div>
          <h3 class="text-slate-600 mb-4">No tickets assigned</h3>
          <p class="text-slate-500">You don't have any tickets assigned to you yet.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" *ngIf="!loading && tickets.length > 0">
        <div *ngFor="let ticket of tickets" 
             class="bg-white p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl border-l-4 border-l-slate-400"
             [routerLink]="['/tickets', ticket.id]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-800 mb-1">{{ticket.title}}</h3>
              <span class="text-sm text-slate-600">#{{ticket.id}}</span>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <span class="px-3 py-1 rounded-full text-xs font-bold"
                    [ngClass]="{
                      'bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800': ticket.priority === 'low',
                      'bg-gradient-to-r from-amber-100 to-orange-200 text-amber-800': ticket.priority === 'medium',
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800': ticket.priority === 'high'
                    }">{{ticket.priority | uppercase}}</span>
              <span class="px-3 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800': ticket.status === 'open',
                      'bg-gradient-to-r from-amber-100 to-orange-200 text-amber-800': ticket.status === 'in_progress',
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800': ticket.status === 'on_hold',
                      'bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800': ticket.status === 'resolved'
                    }">{{getStatusLabel(ticket.status)}}</span>
            </div>
          </div>
          
          <p class="text-slate-600 mb-4 leading-relaxed">{{getShortDescription(ticket.description)}}</p>
          
          <div class="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg mb-4 text-sm border border-slate-200">
            <strong class="text-slate-700">Customer:</strong> <span class="text-slate-800">{{ticket.customer_first_name}} {{ticket.customer_last_name}}</span><br>
            <span class="text-slate-600">{{ticket.customer_email}}</span>
          </div>
          
          <div class="mb-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium text-slate-600">Created:</span>
              <span class="text-slate-700">{{ticket.created_at | date:'MMM d, h:mm a'}}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-medium text-slate-600">SLA Deadline:</span>
              <span [class.text-red-600]="isOverdue(ticket.sla_deadline) && !isResolved(ticket.status)" 
                    [class.font-medium]="isOverdue(ticket.sla_deadline) && !isResolved(ticket.status)"
                    [class.text-emerald-600]="isResolved(ticket.status)"
                    [class.line-through]="isResolved(ticket.status)"
                    class="text-slate-700">
                {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
                <span *ngIf="isResolved(ticket.status)" class="ml-2 text-xs text-emerald-600">(Resolved)</span>
              </span>
            </div>
            <div class="flex justify-between text-sm" *ngIf="ticket.category">
              <span class="font-medium text-slate-600">Category:</span>
              <span class="text-slate-700">{{ticket.category}}</span>
            </div>
          </div>
          
          <div class="border-t border-slate-200 pt-4">
            <button class="bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">View Details</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
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

  isResolved(status: string): boolean {
    return status === 'resolved' || status === 'closed';
  }
}