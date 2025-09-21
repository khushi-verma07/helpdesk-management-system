export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'agent' | 'admin';
  phone?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'customer' | 'agent' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}