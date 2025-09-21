import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket, CreateTicketRequest } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  constructor(private http: HttpClient) {}

  createTicket(ticket: CreateTicketRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tickets`, ticket);
  }

  getMyTickets(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tickets/my`);
  }

  getTicketById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tickets/${id}`);
  }

  addMessage(ticketId: number, message: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tickets/${ticketId}/messages`, { message });
  }

  // Admin methods
  getUnassignedTickets(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/tickets/unassigned`);
  }

  getAllTickets(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/tickets`);
  }

  getAgents(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/agents`);
  }

  assignTicket(ticketId: number, agentId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/tickets/assign`, { ticketId, agentId });
  }

  // Agent methods
  getAssignedTickets(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tickets/assigned`);
  }

  updateTicketStatus(ticketId: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/tickets/${ticketId}/status`, { status });
  }

  addInternalNote(ticketId: number, note: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tickets/${ticketId}/internal-notes`, { note });
  }
}