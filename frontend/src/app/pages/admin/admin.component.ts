import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        <!-- Stats Cards -->
        <div class="bg-white p-4 rounded border">
          <div class="text-2xl font-bold text-blue-600">{{stats.totalTickets}}</div>
          <div class="text-sm text-gray-600">Total Tickets</div>
        </div>
        
        <div class="bg-white p-4 rounded border">
          <div class="text-2xl font-bold text-green-600">{{stats.activeAgents}}</div>
          <div class="text-sm text-gray-600">Active Agents</div>
        </div>
        
        <div class="bg-white p-4 rounded border">
          <div class="text-2xl font-bold text-red-600">{{stats.pendingTickets}}</div>
          <div class="text-sm text-gray-600">Pending Tickets</div>
        </div>
        
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- All Tickets -->
        <div class="bg-white p-4 rounded border">
          <h2 class="text-lg font-semibold mb-4">All Tickets</h2>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div *ngFor="let ticket of allTickets" class="p-3 bg-gray-50 rounded">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">#{{ticket.id}} {{ticket.title}}</div>
                  <div class="text-sm text-gray-600">{{ticket.customer}}</div>
                  <div class="text-xs text-gray-500">Agent: {{ticket.agent || 'Unassigned'}}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs px-2 py-1 rounded" 
                       [class]="getStatusClass(ticket.status)">
                    {{ticket.status}}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ticket.time}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agents Management -->
        <div class="bg-white p-4 rounded border">
          <h2 class="text-lg font-semibold mb-4">Agents</h2>
          <div class="space-y-3">
            <div *ngFor="let agent of agents" class="p-3 bg-gray-50 rounded">
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium">{{agent.name}}</div>
                  <div class="text-sm text-gray-600">{{agent.email}}</div>
                </div>
                <div class="text-right">
                  <div class="text-xs px-2 py-1 rounded"
                       [class]="agent.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                    {{agent.status}}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{agent.tickets}} tickets</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Assign Ticket Section -->
      <div class="bg-white p-4 rounded border mt-6">
        <h2 class="text-lg font-semibold mb-4">Assign Ticket</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select [(ngModel)]="selectedTicket" class="px-3 py-2 border rounded">
            <option value="">Select Ticket</option>
            <option *ngFor="let ticket of unassignedTickets" [value]="ticket.id">
              #{{ticket.id}} - {{ticket.title}}
            </option>
          </select>
          
          <select [(ngModel)]="selectedAgent" class="px-3 py-2 border rounded">
            <option value="">Select Agent</option>
            <option *ngFor="let agent of agents" [value]="agent.id">
              {{agent.name}}
            </option>
          </select>
          
          <button 
            (click)="assignTicket()" 
            [disabled]="!selectedTicket || !selectedAgent"
            class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Assign
          </button>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class AdminComponent {
  selectedTicket = '';
  selectedAgent = '';

  stats = {
    totalTickets: 45,
    activeAgents: 8,
    pendingTickets: 12
  };

  allTickets = [
    { id: '001', title: 'Login Issue', customer: 'John Doe', agent: 'Alice Smith', status: 'Open', time: '2 min ago' },
    { id: '002', title: 'Payment Problem', customer: 'Jane Smith', agent: 'Bob Wilson', status: 'In Progress', time: '5 min ago' },
    { id: '003', title: 'Feature Request', customer: 'Bob Wilson', agent: null, status: 'Pending', time: '10 min ago' },
    { id: '004', title: 'Bug Report', customer: 'Mary Johnson', agent: 'Alice Smith', status: 'Resolved', time: '1 hour ago' }
  ];

  agents = [
    { id: '1', name: 'Alice Smith', email: 'alice@company.com', status: 'Online', tickets: 5 },
    { id: '2', name: 'Bob Wilson', email: 'bob@company.com', status: 'Online', tickets: 3 },
    { id: '3', name: 'Carol Davis', email: 'carol@company.com', status: 'Offline', tickets: 2 }
  ];

  unassignedTickets = [
    { id: '003', title: 'Feature Request' },
    { id: '005', title: 'Account Issue' }
  ];

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  assignTicket() {
    if (this.selectedTicket && this.selectedAgent) {
      console.log(`Assigning ticket ${this.selectedTicket} to agent ${this.selectedAgent}`);
      this.selectedTicket = '';
      this.selectedAgent = '';
    }
  }
}