// src/app/services/auth-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
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

// ---- Roles y estado ----
const ALL_ROLES = ['ADMINISTRADOR','RECEPCIONISTA','CONSERJE','LIMPIEZA','CLIENTE'] as const;
export type Role = typeof ALL_ROLES[number];

export interface AuthState {
  isLoggedIn: boolean;
  roles: Role[];
  userId?: string | number;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = environment.API_BASE_URL + '/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly ROLES_KEY = 'user_roles';

  private _state = new BehaviorSubject<AuthState>({ isLoggedIn: false, roles: [] });
  readonly state$ = this._state.asObservable();
  readonly isLoggedIn$ = this.state$.pipe(map(s => s.isLoggedIn));
  readonly roles$ = this.state$.pipe(map(s => s.roles));
  readonly userId$ = this.state$.pipe(map(s => s.userId));

  constructor(private http: HttpClient, private router: Router) {
    // Restaurar desde localStorage al iniciar
    const token = localStorage.getItem(this.TOKEN_KEY) || undefined;
    if (token) this._state.next(this.buildStateFromToken(token));
  }

  // -------- LOGIN / LOGOUT --------
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.BASE}/login`,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(({ token }) => {
        localStorage.setItem(this.TOKEN_KEY, token);
        const st = this.buildStateFromToken(token);
        // opcional: mantener compat con código viejo que lee roles de localStorage
        localStorage.setItem(this.ROLES_KEY, JSON.stringify(st.roles));
        this._state.next(st);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLES_KEY);
    this._state.next({ isLoggedIn: false, roles: [] });
    this.router.navigate(['/']); // volver al inicio
  }

  // -------- Helpers públicos (compat + conveniencia) --------
  isLoggedIn(): boolean { return this._state.value.isLoggedIn; }
  getUserRoles(): Role[] { return this._state.value.roles; }
  hasAnyRole(roles: Role[] | string[]): boolean {
    const mine = new Set(this._state.value.roles.map(r => r.toUpperCase()));
    return roles.some(r => mine.has(String(r).toUpperCase() as Role));
  }
  getUserId(): string | number | undefined { return this._state.value.userId; }
  get token(): string | undefined { return this._state.value.token; }

  // -------- SIGN UP --------
  registerInitiate(dto: UsuarioRequest): Observable<{ message: string; code?: string }> {
    return this.http.post<{ message: string; code?: string }>(
      `${this.BASE}/register/initiate`, dto,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  verifyRegistration(code: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.BASE}/register/verify`, { params: { code } });
  }

  // -------- RECOVERY --------
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

  // ===================== Privados =====================
  private buildStateFromToken(token: string): AuthState {
    let decoded: any = {};
    try { decoded = jwtDecode(token); } catch { /* token inválido */ }

    const roles = this.parseRoles(decoded?.roles ?? decoded?.authorities ?? decoded?.role ?? []);
    const userId =
      decoded?.userId ?? decoded?.user_id ?? decoded?.uid ?? decoded?.id ?? decoded?.sub;

    return {
      isLoggedIn: true,
      roles,
      userId,
      token
    };
  }

  private parseRoles(raw: any): Role[] {
    const arr: string[] = Array.isArray(raw) ? raw : [raw];
    const cleaned = arr
      .filter(Boolean)
      .map(r => String(r).replace(/^ROLE_/, '').toUpperCase());

    const valid = new Set<string>(ALL_ROLES as unknown as string[]);
    return cleaned.filter(r => valid.has(r)) as Role[];
  }
}
