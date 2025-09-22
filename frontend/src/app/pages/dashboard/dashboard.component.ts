import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { User } from '../../models/user.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-slate-50 px-8 py-4 shadow-sm flex justify-between items-center border-b border-slate-200">
        <h1 class="text-2xl font-bold text-slate-800">{{getWelcomeMessage()}}</h1>
        <div class="flex items-center gap-4">
          <span class="text-slate-700">{{user?.first_name}} {{user?.last_name}} ({{user?.role}})</span>
          <button (click)="logout()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded">Logout</button>
        </div>
      </header>

      <nav class="bg-white px-8 py-4 border-b border-slate-200">
        <div class="flex gap-8">
          <a routerLink="/dashboard" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">🏠 Dashboard</a>
          
          <a *ngIf="user?.role === 'customer'" routerLink="/tickets/create" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">📝 Create Ticket</a>
          <a *ngIf="user?.role === 'customer'" routerLink="/tickets/my" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">🎫 My Tickets</a>
          
          <a *ngIf="user?.role === 'agent'" routerLink="/tickets/assigned" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">📋 Assigned to Me</a>
          
          <a *ngIf="user?.role === 'admin'" routerLink="/admin/dashboard" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">📈 Analytics</a>
          <a *ngIf="user?.role === 'admin'" routerLink="/admin/tickets/unassigned" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">📥 Unassigned Tickets</a>
          <a *ngIf="user?.role === 'admin'" routerLink="/admin/tickets" class="text-slate-800 hover:bg-slate-100 px-4 py-2 rounded transition-colors">📊 All Tickets</a>
        </div>
      </nav>

      <main class="p-4">
        <!-- Customer Dashboard -->
        <div *ngIf="user?.role === 'customer'" class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <!-- Left Side - Create Ticket Box -->
            <div class="flex justify-start">
              <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6 max-w-sm w-full hover:shadow-xl transition-all duration-200 animate-slide-up">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span class="text-2xl text-white">🎫</span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-800 mb-2">Need Help?</h3>
                  <p class="text-sm text-slate-600">Create a support ticket</p>
                </div>
                
                <div class="space-y-3 mb-6">
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>24/7 Support</span>
                  </div>
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>2-Hour Response</span>
                  </div>
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span>Expert Team</span>
                  </div>
                </div>
                
                <button routerLink="/tickets/create" class="w-full bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Create Ticket
                </button>
                
                <div class="mt-4 text-center">
                  <a routerLink="/tickets/my" class="text-sm text-slate-500 hover:text-slate-700 transition-colors">View My Tickets →</a>
                </div>
              </div>
            </div>

            <!-- Right Side - Text Content -->
            <div class="space-y-6 animate-fade-in" style="animation-delay: 0.2s">
              <div>
                <h1 class="text-3xl font-bold text-slate-800 mb-3 leading-tight">
                  Welcome back,
                  <span class="text-slate-800">{{user?.first_name}}</span> 👋
                </h1>
                <p class="text-base text-slate-600">
                  We're here to provide exceptional support for all your needs.
                </p>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-lg">⚡</span>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-800">Fast Response</h3>
                    <p class="text-sm text-slate-600">2-hour average</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-800">Expert Team</h3>
                    <p class="text-sm text-slate-600">Certified professionals</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-lg">🔒</span>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-800">Secure</h3>
                    <p class="text-sm text-slate-600">Enterprise security</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                <div class="flex items-center mb-4">
                  <span class="text-xl mr-2">📊</span>
                  <h3 class="text-base font-semibold text-slate-800">My Statistics</h3>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="bg-white rounded-lg p-3">
                    <div class="text-xl font-bold text-blue-600">{{customerStats.open || 0}}</div>
                    <div class="text-xs text-slate-600">Open</div>
                  </div>
                  <div class="bg-white rounded-lg p-3">
                    <div class="text-xl font-bold text-green-600">{{customerStats.resolved || 0}}</div>
                    <div class="text-xs text-slate-600">Resolved</div>
                  </div>
                  <div class="bg-white rounded-lg p-3">
                    <div class="text-xl font-bold text-purple-600">{{customerStats.total || 0}}</div>
                    <div class="text-xs text-slate-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agent Dashboard -->
<div *ngIf="user?.role === 'agent'" class="max-w-6xl mx-auto space-y-6">
  
  <!-- Top Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
    
    <!-- Left Side: Welcome Message -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">
          Welcome back, {{ user?.first_name }} 👋
        </h2>
        <p class="text-slate-600 text-sm">
          Ready to assist customers and manage your tickets today?
        </p>
      </div>
    </div>
    
    <!-- Right Side: Info Paragraph -->
    <div class="bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg p-6 text-white shadow-md">
      <p class="text-base leading-relaxed">
        As an agent, your workspace is designed to make customer support seamless.  
        Track tickets, manage priorities, and deliver outstanding service — all in one place.
      </p>
    </div>

  </div>

  <!-- Bottom Grid: Tips and Ticket Counts -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- Helpful Tips -->
    <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
      <h3 class="text-lg font-semibold text-slate-700 mb-3 flex items-center">
        <span class="mr-2">💡</span>
        Helpful Tips for Today
      </h3>
      <ul class="list-disc list-inside text-sm text-slate-600 space-y-2">
        <li>Prioritize tickets marked as <span class="font-medium text-amber-600">High</span>.</li>
        <li>Keep responses clear and professional for better ratings.</li>
        <li>Use the search option to quickly find customer history.</li>
      </ul>
    </div>

    <!-- Ticket Counts Box -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
      <h3 class="text-lg font-semibold text-slate-700 mb-4 flex items-center">
        <span class="mr-2">📊</span>
        My Tickets
      </h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
          <div>
            <div class="text-sm font-medium text-slate-600">Assigned</div>
          </div>
          <div class="text-xl font-bold text-slate-700">{{ticketCounts.assigned || 0}}</div>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg">
          <div>
            <div class="text-sm font-medium text-blue-600">Pending</div>
          </div>
          <div class="text-xl font-bold text-blue-700">{{ticketCounts.pending || 0}}</div>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-green-100 rounded-lg">
          <div>
            <div class="text-sm font-medium text-emerald-600">Resolved</div>
            
          </div>
          <div class="text-xl font-bold text-emerald-700">{{ticketCounts.resolved || 0}}</div>
        </div>
      </div>
    </div>
    
  </div>

</div>

        <!-- Admin Dashboard -->
        <div *ngIf="user?.role === 'admin'" class="max-w-6xl mx-auto space-y-6">
          
          <!-- Welcome Section -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Admin Analytics Dashboard</h2>
                <p class="text-gray-600">Monitor system performance and manage tickets efficiently</p>
              </div>
              <div class="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <span class="text-white text-xl">📈</span>
              </div>
            </div>
          </div>

          <!-- Analytics Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- Total Tickets -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                  <span class="text-slate-600">🎫</span>
                </div>
                <span class="text-2xl font-bold text-blue-600">{{adminStats.total || 0}}</span>
              </div>
              <h3 class="text-sm font-medium text-slate-600 mb-1">Total Tickets</h3>
              <p class="text-xs text-slate-500">All system tickets</p>
            </div>

            <!-- Unassigned Tickets -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <span class="text-amber-600">📥</span>
                </div>
                <span class="text-2xl font-bold text-orange-600">{{adminStats.unassigned || 0}}</span>
              </div>
              <h3 class="text-sm font-medium text-amber-600 mb-1">Unassigned</h3>
              <p class="text-xs text-amber-500">Need assignment</p>
            </div>

            <!-- Open Tickets -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600">🔓</span>
                </div>
                <span class="text-2xl font-bold text-red-600">{{adminStats.open || 0}}</span>
              </div>
              <h3 class="text-sm font-medium text-blue-600 mb-1">Open Tickets</h3>
              <p class="text-xs text-blue-500">Active issues</p>
            </div>

            <!-- Resolved Tickets -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-200 rounded-lg flex items-center justify-center">
                  <span class="text-emerald-600">✅</span>
                </div>
                <span class="text-2xl font-bold text-green-600">{{adminStats.resolved || 0}}</span>
              </div>
              <h3 class="text-sm font-medium text-emerald-600 mb-1">Resolved</h3>
              <p class="text-xs text-emerald-500">Completed tickets</p>
            </div>

          </div>

          <!-- Action Buttons -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-up">
            <h3 class="text-lg font-semibold text-slate-700 mb-4">Quick Actions</h3>
            <div class="flex gap-4 flex-wrap">
              <button routerLink="/admin/dashboard" class="bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all">
                📈 Detailed Analytics
              </button>
              <button routerLink="/admin/tickets/unassigned" class="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                📥 Assign Tickets ({{adminStats.unassigned || 0}})
              </button>
              <button routerLink="/admin/tickets" class="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
                📊 View All Tickets
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
    }
    
    .animate-slide-up {
      animation: slide-up 0.6s ease-out forwards;
      opacity: 0;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  ticketCounts = {
    assigned: 0,
    pending: 0,
    resolved: 0
  };
  customerStats = {
    open: 0,
    resolved: 0,
    total: 0
  };
  adminStats = {
    total: 0,
    unassigned: 0,
    open: 0,
    resolved: 0
  };
  private refreshSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user?.role === 'agent') {
      this.loadTicketCounts();
      this.refreshSubscription = interval(30000).subscribe(() => {
        this.loadTicketCounts();
      });
    } else if (this.user?.role === 'customer') {
      this.loadCustomerStats();
      this.refreshSubscription = interval(30000).subscribe(() => {
        this.loadCustomerStats();
      });
    } else if (this.user?.role === 'admin') {
      this.loadAdminStats();
      this.refreshSubscription = interval(30000).subscribe(() => {
        this.loadAdminStats();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadTicketCounts(): void {
    this.ticketService.getAssignedTickets().subscribe({
      next: (response) => {
        const tickets = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
        this.ticketCounts.assigned = tickets.length;
        this.ticketCounts.pending = tickets.filter((t: any) => 
          t.status === 'open' || t.status === 'pending' || t.status === 'in_progress'
        ).length;
        this.ticketCounts.resolved = tickets.filter((t: any) => 
          t.status === 'resolved' || t.status === 'closed'
        ).length;
      },
      error: (error) => {
        console.error('Error loading ticket counts:', error);
        this.ticketCounts = { assigned: 0, pending: 0, resolved: 0 };
      }
    });
  }

  loadCustomerStats(): void {
    this.ticketService.getMyTickets().subscribe({
      next: (response) => {
        const tickets = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
        this.customerStats.total = tickets.length;
        this.customerStats.open = tickets.filter((t: any) => 
          t.status === 'open' || t.status === 'pending' || t.status === 'in_progress'
        ).length;
        this.customerStats.resolved = tickets.filter((t: any) => 
          t.status === 'resolved' || t.status === 'closed'
        ).length;
      },
      error: (error) => {
        console.error('Error loading customer stats:', error);
        this.customerStats = { open: 0, resolved: 0, total: 0 };
      }
    });
  }

  loadAdminStats(): void {
    // Load all tickets
    this.ticketService.getAllTickets().subscribe({
      next: (response) => {
        const tickets = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
        this.adminStats.total = tickets.length;
        this.adminStats.open = tickets.filter((t: any) => 
          t.status === 'open' || t.status === 'pending' || t.status === 'in_progress'
        ).length;
        this.adminStats.resolved = tickets.filter((t: any) => 
          t.status === 'resolved' || t.status === 'closed'
        ).length;
      },
      error: (error) => {
        console.error('Error loading all tickets:', error);
      }
    });

    // Load unassigned tickets
    this.ticketService.getUnassignedTickets().subscribe({
      next: (response) => {
        const tickets = Array.isArray(response) ? response : (response?.tickets || response?.data || []);
        this.adminStats.unassigned = tickets.length;
      },
      error: (error) => {
        console.error('Error loading unassigned tickets:', error);
        this.adminStats.unassigned = 0;
      }
    });
  }

  getWelcomeMessage(): string {
    if (!this.user) return 'Welcome';
    
    switch (this.user.role) {
      case 'customer':
        return 'Customer Dashboard';
      case 'agent':
        return 'Agent Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}