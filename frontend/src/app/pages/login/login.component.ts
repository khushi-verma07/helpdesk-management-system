import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="h-screen bg-white flex items-center justify-center p-4">
      <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center h-full">
        
        <!-- Left Branding Side -->
        <div class="hidden lg:block space-y-4">
          <div class="space-y-3">
            <div class="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <span class="text-xl font-bold text-white">🎧</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold mb-2 text-slate-800">
                HELPDESK
              </h1>
              <p class="text-gray-700">
                Advanced customer support platform
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-2 rounded-lg">
              <div class="text-xl font-bold text-blue-600">24/7</div>
              <div class="text-blue-500 text-xs font-medium">Support</div>
            </div>
            <div class="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-2 rounded-lg">
              <div class="text-xl font-bold text-green-600">99.8%</div>
              <div class="text-green-500 text-xs font-medium">Uptime</div>
            </div>
            <div class="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-2 rounded-lg">
              <div class="text-xl font-bold text-purple-600">15.2k</div>
              <div class="text-purple-500 text-xs font-medium">Users</div>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2 bg-gradient-to-r from-cyan-50 to-blue-50 p-2 rounded">
              <div class="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
              <span class="text-gray-700 text-sm">Real-time ticket management</span>
            </div>
            <div class="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded">
              <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span class="text-gray-700 text-sm">Advanced analytics & reporting</span>
            </div>
            <div class="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded">
              <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span class="text-gray-700 text-sm">Multi-channel communication</span>
            </div>
          </div>
        </div>

        <!-- Right Login Form Side -->
        <div class="w-full max-w-md mx-auto">
          <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
            
            <div class="text-center mb-4">
              <div class="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span class="text-white font-bold">🔐</span>
              </div>
              <h2 class="text-xl font-bold text-gray-800 mb-1">Welcome Back</h2>
              <p class="text-gray-600 text-sm">Sign in to access your dashboard</p>
            </div>
            
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  formControlName="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-slate-200 focus:border-slate-500"
                  placeholder="Enter your email"
                />
                <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                  <div *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</div>
                  <div *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email address</div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password"
                  formControlName="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-slate-200 focus:border-slate-500"
                  placeholder="Enter your password"
                />
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                  <div *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</div>
                  <div *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs">
                <label class="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" class="w-3 h-3 rounded text-slate-500"/>
                  <span>Remember me</span>
                </label>
                <a href="#" class="text-slate-600 hover:text-slate-700 font-medium">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                [disabled]="loginForm.invalid || loading"
                class="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 rounded-md font-medium hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 text-base"
              >
                <span *ngIf="!loading">Sign In</span>
                <span *ngIf="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              </button>
            </form>

            <div *ngIf="errorMessage" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <span class="text-red-700">{{errorMessage}}</span>
            </div>

            <div class="mt-4 text-center text-xs">
              <span class="text-gray-600">Don't have an account? </span>
              <a routerLink="/register" class="text-slate-600 font-medium hover:text-slate-700">Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Login failed';
          this.loading = false;
        }
      });
    }
  }
}