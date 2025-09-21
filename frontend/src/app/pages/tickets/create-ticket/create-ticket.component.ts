import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="create-ticket-container">
      <div class="create-ticket-card">
        <h2>Create New Ticket</h2>
        
        <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Title *</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title"
              placeholder="Brief description of your issue">
            <div *ngIf="ticketForm.get('title')?.invalid && ticketForm.get('title')?.touched" class="error-msg">
              Title is required
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea 
              id="description" 
              formControlName="description" 
              rows="5"
              placeholder="Detailed description of your issue"></textarea>
            <div *ngIf="ticketForm.get('description')?.invalid && ticketForm.get('description')?.touched" class="error-msg">
              Description is required
            </div>
          </div>

          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority" formControlName="priority">
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Standard issue</option>
              <option value="high">High - Urgent issue</option>
            </select>
          </div>

          <div class="form-group">
            <label for="category">Category (Optional)</label>
            <input 
              type="text" 
              id="category" 
              formControlName="category"
              placeholder="e.g., Technical, Billing, General">
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/dashboard" class="btn-secondary">Cancel</button>
            <button type="submit" [disabled]="ticketForm.invalid || loading" class="btn-primary">
              {{loading ? 'Creating...' : 'Create Ticket'}}
            </button>
          </div>
        </form>

        <div *ngIf="errorMessage" class="error-msg">{{errorMessage}}</div>
      </div>
    </div>
  `,
  styles: [`
    .create-ticket-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    .create-ticket-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #007bff;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    .btn-primary {
      background-color: #28a745;
      color: white;
    }
    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    .error-msg {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class CreateTicketComponent {
  ticketForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['medium', Validators.required],
      category: ['']
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.ticketService.createTicket(this.ticketForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/tickets/my']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create ticket';
          this.loading = false;
        }
      });
    }
  }
}