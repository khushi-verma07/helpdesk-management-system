import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketService } from '../../../services/ticket.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
      <!-- Header -->
      <div class="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <div class="flex items-center gap-4">
                  <button routerLink="/dashboard" class="text-emerald-600 hover:text-emerald-800 text-lg">←</button>
                  <h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">Admin Analytics</h1>
                </div>
                <p class="text-sm text-gray-500">Real-time system overview</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-medium flex items-center space-x-1">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              <button (click)="loadDashboardData()" class="p-2 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center py-20">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-emerald-600">Loading dashboard...</p>
          </div>
        </div>
        
        <!-- Dashboard Content -->
        <div *ngIf="!loading" class="space-y-8">
          <!-- Key Metrics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all group">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-white font-bold text-lg">🎫</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-blue-700">{{analytics.totalTickets}}</div>
                  <div class="text-xs text-blue-600 uppercase tracking-wide">Total Tickets</div>
                </div>
              </div>
              <div class="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>

            <div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all group">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-white font-bold text-lg">🔥</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-orange-700">{{analytics.openTickets}}</div>
                  <div class="text-xs text-orange-600 uppercase tracking-wide">Open Tickets</div>
                </div>
              </div>
              <div class="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            </div>

            <div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all group">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-white font-bold text-lg">✅</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-700">{{analytics.resolvedTickets}}</div>
                  <div class="text-xs text-green-600 uppercase tracking-wide">Resolved</div>
                </div>
              </div>
              <div class="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            </div>

            <div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all group">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-white font-bold text-lg">📥</span>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-700">{{analytics.unassignedTickets}}</div>
                  <div class="text-xs text-purple-600 uppercase tracking-wide">Unassigned</div>
                </div>
              </div>
              <div class="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          <!-- Priority and Users Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Priority Breakdown -->
            <div class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 class="text-lg font-semibold text-emerald-800 mb-6 flex items-center space-x-2">
                <span class="text-xl">🎯</span>
                <span>Priority Breakdown</span>
              </h3>
              <div class="space-y-4">
                <div class="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div class="flex justify-between items-center mb-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800">HIGH</span>
                    <span class="font-bold text-red-700">{{analytics.highPriority}}</span>
                  </div>
                  <div class="w-full bg-red-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500" 
                         [style.width.%]="getPriorityPercentage(analytics.highPriority)"></div>
                  </div>
                </div>

                <div class="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                  <div class="flex justify-between items-center mb-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-200 text-yellow-800">MEDIUM</span>
                    <span class="font-bold text-yellow-700">{{analytics.mediumPriority}}</span>
                  </div>
                  <div class="w-full bg-yellow-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500" 
                         [style.width.%]="getPriorityPercentage(analytics.mediumPriority)"></div>
                  </div>
                </div>

                <div class="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div class="flex justify-between items-center mb-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800">LOW</span>
                    <span class="font-bold text-green-700">{{analytics.lowPriority}}</span>
                  </div>
                  <div class="w-full bg-green-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                         [style.width.%]="getPriorityPercentage(analytics.lowPriority)"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Statistics -->
            <div class="lg:col-span-2 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
              <h3 class="text-lg font-semibold text-emerald-800 mb-6 flex items-center space-x-2">
                <span class="text-xl">👥</span>
                <span>System Users</span>
                <span *ngIf="selectedUserType" class="text-sm font-normal text-emerald-600">
                  - {{selectedUserType | titlecase}} ({{getFilteredUsers().length}})
                </span>
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
                     [class.ring-2]="selectedUserType === 'all'"
                     [class.ring-blue-500]="selectedUserType === 'all'"
                     (click)="filterUsers('all')">
                  <div class="text-2xl font-bold text-blue-600 mb-1">{{analytics.totalUsers}}</div>
                  <div class="text-sm text-blue-600">Total Users</div>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
                     [class.ring-2]="selectedUserType === 'agent'"
                     [class.ring-green-500]="selectedUserType === 'agent'"
                     (click)="filterUsers('agent')">
                  <div class="text-2xl font-bold text-green-600 mb-1">{{analytics.totalAgents}}</div>
                  <div class="text-sm text-green-600">Agents</div>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:shadow-md transition-all"
                     [class.ring-2]="selectedUserType === 'customer'"
                     [class.ring-purple-500]="selectedUserType === 'customer'"
                     (click)="filterUsers('customer')">
                  <div class="text-2xl font-bold text-purple-600 mb-1">{{analytics.totalCustomers}}</div>
                  <div class="text-sm text-purple-600">Customers</div>
                </div>
              </div>
              
              <!-- User List -->
              <div class="max-h-64 overflow-y-auto space-y-2">
                <div *ngFor="let user of getFilteredUsers()" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                         [ngClass]="{
                           'bg-blue-100 text-blue-800': user.role === 'admin',
                           'bg-green-100 text-green-800': user.role === 'agent',
                           'bg-purple-100 text-purple-800': user.role === 'customer'
                         }">
                      {{getInitials(user)}}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{getUserName(user)}}</div>
                      <div class="text-xs text-gray-500">{{user.email}}</div>
                    </div>
                  </div>
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': user.role === 'admin',
                          'bg-green-100 text-green-800': user.role === 'agent',
                          'bg-purple-100 text-purple-800': user.role === 'customer'
                        }">
                    {{user.role | titlecase}}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Summary -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div class="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
              <h3 class="text-xl font-bold text-white flex items-center space-x-2">
                <span class="text-2xl">🏆</span>
                <span>Performance Summary</span>
              </h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div class="text-3xl font-bold text-blue-600 mb-2">{{getResolutionRate()}}%</div>
                  <div class="text-sm text-blue-600 mb-2">Resolution Rate</div>
                  <div class="text-xs text-gray-500 mb-2">{{analytics.resolvedTickets}}/{{analytics.totalTickets}} resolved</div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium" 
                        [ngClass]="{
                          'bg-green-100 text-green-800': getResolutionRate() >= 80,
                          'bg-yellow-100 text-yellow-800': getResolutionRate() >= 60 && getResolutionRate() < 80,
                          'bg-red-100 text-red-800': getResolutionRate() < 60
                        }">
                    {{getResolutionRate() >= 80 ? 'Excellent' : getResolutionRate() >= 60 ? 'Good' : 'Needs Improvement'}}
                  </span>
                </div>
                <div class="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div class="text-3xl font-bold text-green-600 mb-2">{{analytics.totalAgents}}</div>
                  <div class="text-sm text-green-600 mb-2">Active Agents</div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
                <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div class="text-3xl font-bold text-purple-600 mb-2">{{analytics.totalCustomers}}</div>
                  <div class="text-sm text-purple-600 mb-2">Total Customers</div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Registered
                  </span>
                </div>
                <div class="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <div class="text-3xl font-bold text-orange-600 mb-2">{{getAvgResponseTime()}}</div>
                  <div class="text-sm text-orange-600 mb-2">Avg Response Time</div>
                  <div class="text-xs text-gray-500 mb-2">Based on {{getResolvedTicketsCount()}} resolved tickets</div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium" 
                        [ngClass]="{
                          'bg-green-100 text-green-800': analytics.avgResponseHours <= 2,
                          'bg-yellow-100 text-yellow-800': analytics.avgResponseHours > 2 && analytics.avgResponseHours <= 8,
                          'bg-orange-100 text-orange-800': analytics.avgResponseHours > 8 && analytics.avgResponseHours <= 24,
                          'bg-red-100 text-red-800': analytics.avgResponseHours > 24
                        }">
                    {{getResponseStatus()}}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  loading = true;
  allUsers: any[] = [];
  uniqueCustomers: Set<string> = new Set();
  selectedUserType: string = 'all';
  analytics = {
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    unassignedTickets: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    totalUsers: 0,
    totalAgents: 0,
    totalCustomers: 0,
    avgResponseHours: 0
  };

  constructor(
    private ticketService: TicketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all tickets
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        const tickets = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
        
        this.analytics.totalTickets = tickets.length;
        this.analytics.openTickets = tickets.filter((t: any) => 
          t.status === 'open' || t.status === 'pending' || t.status === 'in_progress'
        ).length;
        this.analytics.resolvedTickets = tickets.filter((t: any) => 
          t.status === 'resolved' || t.status === 'closed'
        ).length;
        
        // Priority breakdown
        this.analytics.highPriority = tickets.filter((t: any) => t.priority === 'high').length;
        this.analytics.mediumPriority = tickets.filter((t: any) => t.priority === 'medium').length;
        this.analytics.lowPriority = tickets.filter((t: any) => t.priority === 'low').length;
        
        // Extract unique customers from tickets
        this.extractCustomersFromTickets(tickets);
        
        // Calculate average response time
        this.calculateAvgResponseTime(tickets);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.loading = false;
      }
    });

    // Load unassigned tickets
    this.ticketService.getUnassignedTickets().subscribe({
      next: (response) => {
        const tickets = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
        this.analytics.unassignedTickets = tickets.length;
      },
      error: (error) => {
        console.error('Error loading unassigned tickets:', error);
      }
    });

    // Load agents
    this.ticketService.getAgents().subscribe({
      next: (response) => {
        const agents = Array.isArray(response) ? response : (response?.agents || response?.data || []);
        this.analytics.totalAgents = agents.length;
        
        // Add agents to user list
        const agentUsers = agents.map((agent: any) => ({
          ...agent,
          role: 'agent',
          email: agent.email || `agent${agent.id}@company.com`
        }));
        
        this.allUsers = [...this.allUsers, ...agentUsers];
        this.updateTotalUsers();
      },
      error: (error) => {
        console.error('Error loading agents:', error);
      }
    });
  }

  extractCustomersFromTickets(tickets: any[]): void {
    const customerUsers: any[] = [];
    
    tickets.forEach(ticket => {
      if (ticket.customer_email && !this.uniqueCustomers.has(ticket.customer_email)) {
        this.uniqueCustomers.add(ticket.customer_email);
        customerUsers.push({
          id: ticket.customer_id || `customer_${ticket.customer_email}`,
          first_name: ticket.customer_first_name || 'Customer',
          last_name: ticket.customer_last_name || '',
          email: ticket.customer_email,
          role: 'customer'
        });
      }
    });
    
    this.analytics.totalCustomers = customerUsers.length;
    this.allUsers = [...this.allUsers, ...customerUsers];
    this.updateTotalUsers();
  }

  updateTotalUsers(): void {
    this.analytics.totalUsers = this.analytics.totalAgents + this.analytics.totalCustomers;
  }

  calculateAvgResponseTime(tickets: any[]): void {
    const resolvedTickets = tickets.filter(t => (t.status === 'resolved' || t.status === 'closed') && t.created_at);
    if (resolvedTickets.length === 0) {
      this.analytics.avgResponseHours = 0;
      return;
    }

    let totalHours = 0;
    resolvedTickets.forEach(ticket => {
      const created = new Date(ticket.created_at);
      const resolved = new Date(ticket.updated_at || ticket.created_at);
      const diffHours = Math.abs((resolved.getTime() - created.getTime()) / (1000 * 60 * 60));
      totalHours += diffHours;
    });

    this.analytics.avgResponseHours = totalHours / resolvedTickets.length;
  }

  filterUsers(userType: string): void {
    this.selectedUserType = userType;
  }

  getFilteredUsers(): any[] {
    if (this.selectedUserType === 'all') {
      return this.allUsers;
    }
    return this.allUsers.filter(user => user.role === this.selectedUserType);
  }

  getPriorityPercentage(count: number): number {
    return this.analytics.totalTickets > 0 ? (count / this.analytics.totalTickets) * 100 : 0;
  }

  getResolutionRate(): number {
    return this.analytics.totalTickets > 0 ? 
      Math.round((this.analytics.resolvedTickets / this.analytics.totalTickets) * 100) : 0;
  }

  getAvgResponseTime(): string {
    const hours = this.analytics.avgResponseHours;
    if (hours < 1) return '< 1h';
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  }

  getResponseStatus(): string {
    const hours = this.analytics.avgResponseHours;
    if (hours <= 2) return 'Excellent';
    if (hours <= 8) return 'Good';
    if (hours <= 24) return 'Fair';
    return 'Slow';
  }

  getInitials(user: any): string {
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last) || user.email?.charAt(0).toUpperCase() || '?';
  }

  getUserName(user: any): string {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email?.split('@')[0] || 'Unknown User';
  }

  getResolvedTicketsCount(): number {
    return this.analytics.resolvedTickets;
  }
}