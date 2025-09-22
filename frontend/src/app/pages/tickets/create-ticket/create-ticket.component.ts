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
    <div class="h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
      <header class="bg-white px-4 py-2 shadow-lg flex-shrink-0 border-b border-gray-200">
        <h1 class="text-base font-bold text-slate-800">Create Support Ticket</h1>
      </header>
      
      <div class="flex-1 p-2 max-w-lg mx-auto flex items-center">
      <div class="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-white/20 w-full">
        <div class="text-center mb-3">
          <div class="w-5 h-5 bg-gradient-to-r from-slate-600 to-slate-700 rounded flex items-center justify-center mx-auto mb-1">
            <span class="text-white text-xs font-bold">🎫</span>
          </div>
          <h2 class="text-sm font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">Create New Ticket</h2>
        </div>
        
        <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()" class="space-y-3">
          <div>
            <label for="title" class="block text-xs text-gray-700 mb-1">Title *</label>
            <input 
              type="text" 
              id="title" 
              formControlName="title"
              placeholder="Brief description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white/80">
            <div *ngIf="ticketForm.get('title')?.invalid && ticketForm.get('title')?.touched" class="text-red-600 text-xs mt-1">
              Title is required
            </div>
          </div>

          <div>
            <label for="description" class="block text-xs text-gray-700 mb-1">Description *</label>
            <textarea 
              id="description" 
              formControlName="description" 
              rows="3"
              placeholder="Describe your issue"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white/80"></textarea>
            <div *ngIf="ticketForm.get('description')?.invalid && ticketForm.get('description')?.touched" class="text-red-600 text-xs mt-1">
              Description is required
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="priority" class="block text-xs text-gray-700 mb-1">Priority</label>
              <select id="priority" formControlName="priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white/80">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label for="category" class="block text-xs text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                id="category" 
                formControlName="category"
                placeholder="e.g., Technical"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white/80">
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-2">
            <button type="button" routerLink="/dashboard" class="border-2 border-slate-600 bg-transparent text-slate-700 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 hover:!text-white hover:border-transparent px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200">Cancel</button>
            <button type="submit" [disabled]="ticketForm.invalid || loading" class="border-2 border-slate-600 bg-transparent text-slate-700 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 hover:!text-white hover:border-transparent disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:hover:border-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
              {{loading ? 'Creating...' : 'Create Ticket'}}
            </button>
          </div>
        </form>

        <div *ngIf="errorMessage" class="text-red-600 text-xs mt-2 p-2 bg-red-50/80 border border-red-200 rounded-lg backdrop-blur-sm">{{errorMessage}}</div>
      </div>
    </div>
  `,
  styles: []
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