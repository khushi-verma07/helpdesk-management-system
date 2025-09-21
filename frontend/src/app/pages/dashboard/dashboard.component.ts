import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>{{getWelcomeMessage()}}</h1>
        <div class="user-info">
          <span>{{user?.first_name}} {{user?.last_name}} ({{user?.role}})</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>

      <nav class="dashboard-nav">
        <div class="nav-links">
          <a routerLink="/dashboard" class="nav-link">🏠 Dashboard</a>
          
          <a *ngIf="user?.role === 'customer'" routerLink="/tickets/create" class="nav-link">📝 Create Ticket</a>
          <a *ngIf="user?.role === 'customer'" routerLink="/tickets/my" class="nav-link">🎫 My Tickets</a>
          
          <a *ngIf="user?.role === 'agent'" routerLink="/tickets/assigned" class="nav-link">📋 Assigned to Me</a>
          
          <a *ngIf="user?.role === 'admin'" routerLink="/admin/dashboard" class="nav-link">📈 Analytics</a>
          <a *ngIf="user?.role === 'admin'" routerLink="/admin/tickets/unassigned" class="nav-link">📥 Unassigned Tickets</a>
          <a *ngIf="user?.role === 'admin'" routerLink="/admin/tickets" class="nav-link">📊 All Tickets</a>
        </div>
      </nav>

      <main class="dashboard-content">
        <div class="dashboard-cards">
          <div *ngIf="user?.role === 'customer'" class="card">
            <h3>Quick Actions</h3>
            <p>Create a new support ticket or check your existing tickets.</p>
            <button routerLink="/tickets/create" class="btn-primary">Create New Ticket</button>
          </div>

          <div *ngIf="user?.role === 'agent'" class="card">
            <h3>Agent Dashboard</h3>
            <p>Manage tickets assigned to you and help customers.</p>
            <button routerLink="/tickets/assigned" class="btn-primary">View Assigned Tickets</button>
          </div>

          <div *ngIf="user?.role === 'admin'" class="card">
            <h3>Admin Panel</h3>
            <p>Assign unassigned tickets to agents and manage the system.</p>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
              <button routerLink="/admin/dashboard" class="btn-primary">Analytics Dashboard</button>
              <button routerLink="/admin/tickets/unassigned" class="btn-secondary">Unassigned Tickets</button>
              <button routerLink="/admin/tickets" class="btn-secondary">All Tickets</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .dashboard-header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logout-btn {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .dashboard-nav {
      background: #343a40;
      padding: 1rem 2rem;
    }
    .nav-links {
      display: flex;
      gap: 2rem;
    }
    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .nav-link:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .dashboard-content {
      padding: 2rem;
    }
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin-top: 1rem;
    }
    .btn-secondary {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin-top: 1rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
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