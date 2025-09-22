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
    <div class="min-h-screen bg-gray-50">
      <header class="bg-slate-50 px-6 py-3 shadow-sm border-b border-slate-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <a routerLink="/dashboard" class="text-slate-600 hover:text-slate-800 text-sm">🏠 Dashboard</a>
            <span class="text-slate-400">></span>
            <span class="text-slate-800 font-medium text-sm">My Tickets</span>
          </div>
          <button routerLink="/tickets/create" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium">+ New Ticket</button>
        </div>
      </header>
      
      <div class="p-4">
        <div class="max-w-6xl mx-auto">
          <div class="mb-4">
            <h2 class="text-xl font-bold text-gray-800 mb-1">My Support Tickets</h2>
            <p class="text-gray-600 text-sm">Track and manage your support requests</p>
          </div>

          <div *ngIf="loading" class="flex items-center justify-center py-12">
            <div class="flex items-center space-x-2 text-gray-600">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm">Loading tickets...</span>
            </div>
          </div>

          <div *ngIf="!loading && tickets.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🎟️</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No tickets found</h3>
            <p class="text-gray-600 mb-4 text-sm">You haven't created any support tickets yet.</p>
            <button routerLink="/tickets/create" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">Create Your First Ticket</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="!loading && tickets.length > 0">
            <div *ngFor="let ticket of tickets" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/tickets', ticket.id]">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-800 text-sm line-clamp-2 flex-1 mr-2">{{ticket.title}}</h3>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="getPriorityClass(ticket.priority)">{{ticket.priority | uppercase}}</span>
              </div>
              
              <p class="text-gray-600 text-xs mb-3 line-clamp-2">{{getShortDescription(ticket.description)}}</p>
              
              <div class="space-y-1.5 mb-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500" *ngIf="ticket.category">🏷️ {{ticket.category}}</span>
                  <span class="text-gray-500">🕰️ {{ticket.created_at | date:'MMM d'}}</span>
                </div>
                <div class="text-xs text-gray-500" *ngIf="ticket.sla_deadline">
                  ⏰ Due: {{ticket.sla_deadline | date:'MMM d, h:mm a'}}
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="getStatusClass(ticket.status)">{{getStatusLabel(ticket.status)}}</span>
                <span class="text-xs text-gray-400">#{{ticket.id}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
    return description.length > 80 ? description.substring(0, 80) + '...' : description;
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
}