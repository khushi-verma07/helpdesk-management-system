import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Register for Ticketing System</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="first_name">First Name:</label>
              <input type="text" id="first_name" formControlName="first_name">
            </div>
            <div class="form-group">
              <label for="last_name">Last Name:</label>
              <input type="text" id="last_name" formControlName="last_name">
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" formControlName="email">
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" formControlName="password">
          </div>

          <div class="form-group">
            <label for="phone">Phone (Optional):</label>
            <input type="tel" id="phone" formControlName="phone">
          </div>

          <div class="form-group">
            <label for="role">Role:</label>
            <select id="role" formControlName="role">
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" [disabled]="registerForm.invalid || loading">
            {{loading ? 'Registering...' : 'Register'}}
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-msg">{{errorMessage}}</div>
        
        <p>Already have an account? <a routerLink="/login">Login here</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }
    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
      flex: 1;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .error-msg {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
      role: ['customer', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed';
          this.loading = false;
        }
      });
    }
  }
}