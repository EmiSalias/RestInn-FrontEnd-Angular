import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getCurrentUser(): { username: string, role: string } | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}