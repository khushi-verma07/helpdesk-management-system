import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardComponent as AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { CreateTicketComponent } from './pages/tickets/create-ticket/create-ticket.component';
import { TicketListComponent } from './pages/tickets/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './pages/tickets/ticket-detail/ticket-detail.component';
import { UnassignedTicketsComponent } from './pages/admin/unassigned-tickets/unassigned-tickets.component';
import { AllTicketsComponent } from './pages/admin/all-tickets/all-tickets.component';
import { AssignedTicketsComponent } from './pages/agent/assigned-tickets/assigned-tickets.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  
  // Customer routes
  { path: 'tickets/create', component: CreateTicketComponent, canActivate: [AuthGuard] },
  { path: 'tickets/my', component: TicketListComponent, canActivate: [AuthGuard] },
  
  // Agent routes
  { path: 'tickets/assigned', component: AssignedTicketsComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'agent' } },
  
  // Admin routes
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/tickets/unassigned', component: UnassignedTicketsComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'admin/tickets', component: AllTicketsComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  
  // Shared routes
  { path: 'tickets/:id', component: TicketDetailComponent, canActivate: [AuthGuard] },
  
  { path: '**', redirectTo: '/login' }
];
