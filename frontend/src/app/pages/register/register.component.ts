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
    <div class="h-screen bg-white flex items-center justify-center p-4">
      <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center h-full overflow-hidden">
        
        <!-- Left Side - Branding -->
        <div class="hidden lg:block space-y-4">
          <div class="space-y-3">
            <div class="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <span class="text-xl font-bold text-white">🚀</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2 text-slate-800">
                Start Your Journey
              </h1>
              <p class="text-gray-700">
                Join thousands of professionals using our platform
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-2 rounded-lg">
              <div class="text-xl font-bold text-green-600">15.2k</div>
              <div class="text-green-500 text-xs font-medium">Active Users</div>
            </div>
            <div class="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-2 rounded-lg">
              <div class="text-xl font-bold text-blue-600">97.3%</div>
              <div class="text-blue-500 text-xs font-medium">Satisfaction</div>
            </div>
          </div>
          
          <div class="space-y-1.5">
            <div class="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 p-1.5 rounded">
              <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span class="text-gray-700 text-sm">Instant activation</span>
            </div>
            <div class="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-1.5 rounded">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span class="text-gray-700 text-sm">Role-based access</span>
            </div>
            <div class="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 p-1.5 rounded">
              <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span class="text-gray-700 text-sm">24/7 support</span>
            </div>
          </div>
        </div>

        <!-- Right Side - Registration Form -->
        <div class="w-full max-w-md mx-auto">
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <!-- Header -->
            <div class="text-center mb-2">
              <div class="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-1">
                <span class="text-white text-sm font-bold">✨</span>
              </div>
              <h2 class="text-lg font-bold text-gray-800">Join HELPDESK</h2>
              <p class="text-gray-600 text-xs">Create your account</p>
            </div>

            <!-- Registration Form -->
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-700 mb-0.5">First Name</label>
                  <input 
                    type="text" 
                    formControlName="first_name" 
                    placeholder="John"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-slate-200 focus:border-slate-500">
                  <div *ngIf="registerForm.get('first_name')?.invalid && registerForm.get('first_name')?.touched" class="text-red-500 text-xs mt-0.5">
                    First name is required
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-700 mb-0.5">Last Name</label>
                  <input 
                    type="text" 
                    formControlName="last_name" 
                    placeholder="Doe"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-slate-200 focus:border-slate-500">
                  <div *ngIf="registerForm.get('last_name')?.invalid && registerForm.get('last_name')?.touched" class="text-red-500 text-xs mt-0.5">
                    Last name is required
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-700 mb-0.5">Email</label>
                <input 
                  type="email" 
                  formControlName="email" 
                  placeholder="Enter your email"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-slate-200 focus:border-slate-500">
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="text-red-500 text-xs mt-0.5">
                  <div *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</div>
                  <div *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</div>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-700 mb-0.5">Password</label>
                <input 
                  type="password" 
                  formControlName="password" 
                  placeholder="Min 6 characters"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-slate-200 focus:border-slate-500">
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="text-red-500 text-xs mt-0.5">
                  <div *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-700 mb-0.5">Phone (Optional)</label>
                <input 
                  type="tel" 
                  formControlName="phone" 
                  placeholder="+1 (555) 123-4567"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-slate-200 focus:border-slate-500">
                <div *ngIf="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched" class="text-red-500 text-xs mt-0.5">
                  <div *ngIf="registerForm.get('phone')?.errors?.['pattern']">Please enter a valid phone number</div>
                </div>
              </div>
              
              <div>
                <label class="block text-xs text-gray-700 mb-0.5">Role</label>
                <select 
                  formControlName="role" 
                  class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-green-200 focus:border-green-500">
                  <option value="customer">Customer</option>
                  <option value="agent">Support Agent</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div class="flex items-start gap-1.5 text-xs">
                <input type="checkbox" class="mt-0.5 w-3 h-3 rounded text-slate-500" required>
                <span class="text-gray-600">
                  I agree to 
                  <a href="#" class="text-slate-600 hover:text-slate-700">Terms</a> 
                  and 
                  <a href="#" class="text-slate-600 hover:text-slate-700">Privacy</a>
                </span>
              </div>
              
              <button 
                type="submit" 
                [disabled]="registerForm.invalid || loading"
                class="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-2.5 rounded font-medium hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 text-sm mt-3">
                <span *ngIf="!loading">Create Account</span>
                <span *ngIf="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              </button>
            </form>

            <div *ngIf="errorMessage" class="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded text-xs">
              <span class="text-red-700">{{errorMessage}}</span>
            </div>

            <div class="mt-2 text-center text-xs">
              <span class="text-gray-600">Already have an account? </span>
              <a routerLink="/login" class="text-slate-600 font-medium hover:text-slate-700">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
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
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
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