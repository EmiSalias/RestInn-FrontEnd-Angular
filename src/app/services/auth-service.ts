// src/app/services/auth-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

export type UsuarioRequest = {
  nombre: string;
  apellido: string;
  nombreLogin: string;
  email: string;
  password: string;
  dni?: string;
  phoneNumber?: string;
  cuit?: string;
};

export type PasswordResetDTO = { code: string; newPassword: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = environment.API_BASE_URL + '/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // --- LOGIN / LOGOUT ---
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.BASE}/login`,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(({ token }) => {
        localStorage.setItem('access_token', token);
        const decoded: any = jwtDecode(token);
        const raw = decoded?.roles ?? decoded?.authorities ?? decoded?.role ?? [];
        const roles: string[] = (Array.isArray(raw) ? raw : [raw])
          .filter(Boolean).map((r: string) => r.replace(/^ROLE_/, '').toUpperCase());
        localStorage.setItem('user_roles', JSON.stringify(roles));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_roles');
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('access_token'); }
  getUserRoles(): string[] {
    try { return JSON.parse(localStorage.getItem('user_roles') || '[]'); } catch { return []; }
  }
  hasAnyRole(roles: string[]): boolean {
    const mine = this.getUserRoles().map(r => r.toUpperCase());
    const needed = roles.map(r => r.toUpperCase());
    return mine.some(r => needed.includes(r));
  }

  // --- SIGN UP ---
  registerInitiate(dto: UsuarioRequest): Observable<{ message: string; code?: string }> {
    return this.http.post<{ message: string; code?: string }>(
      `${this.BASE}/register/initiate`, dto,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  verifyRegistration(code: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.BASE}/register/verify`, { params: { code } });
  }

  // --- RECOVERY ---
  startRecovery(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.BASE}/recovery`, { email },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  verifyRecovery(code: string): Observable<{ message: string; username: string }> {
    return this.http.get<{ message: string; username: string }>(
      `${this.BASE}/recovery/verify`, { params: { code } }
    );
  }
  resetPassword(dto: PasswordResetDTO): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.BASE}/recovery/reset`, dto,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
