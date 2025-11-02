import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly LOGIN_URL = 'http://localhost:8081/api/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      this.LOGIN_URL, 
      { username, password }, 
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(   //Observador
      tap(response => {   //Espía
        const token = response.token;
        localStorage.setItem('access_token', token);

        const decoded = jwtDecode<{ role: string }>(token);
        localStorage.setItem('user_role', decoded.role);
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    this.router.navigate(['/sign_in']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }
}





/*
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import User from '../models/User';

interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly LOGIN_URL = 'http://localhost:8081/api/auth/login';
  private readonly CURRENT_USER_URL = 'http://localhost:8081/api/usuarios/current';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(
      this.LOGIN_URL,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.token);
      }),
      switchMap(() => {
        const token = localStorage.getItem('access_token');
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        return this.http.get<User>(this.CURRENT_USER_URL, { headers });
      }),
      tap(usuario => {
        localStorage.setItem('user_role', usuario.role);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    this.router.navigate(['/sign_in']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }
}*/