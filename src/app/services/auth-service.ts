import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly LOGIN_URL = '/api/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      environment.API_BASE_URL + this.LOGIN_URL,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(({ token }) => {
        localStorage.setItem('access_token', token);

        const decoded = jwtDecode<any>(token);
        const raw = decoded?.roles ?? decoded?.authorities ?? decoded?.role ?? [];
        const roles: string[] = (Array.isArray(raw) ? raw : [raw])
          .filter(Boolean)
          .map((r: string) => r.replace(/^ROLE_/, '').toUpperCase());

        localStorage.setItem('user_roles', JSON.stringify(roles));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_roles');
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRoles(): string[] {
    try { return JSON.parse(localStorage.getItem('user_roles') || '[]'); }
    catch { return []; }
  }
}
