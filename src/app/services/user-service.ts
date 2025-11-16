// src/app/services/user-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import User from '../models/User';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.API_BASE_URL + '/api/usuarios';

  //Obtiene el usuario actualmente autenticado
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/current`);
  }


  //Actualiza los datos del usuario autenticado
  updateCurrentUser(data: Partial<User>): Observable<void> {
    return this.getCurrentUser().pipe(
      switchMap((current) =>
        this.http.put<void>(`${this.baseUrl}/${current.id}`, data)
      )
    );
  }

  //Obtiene un usuario por ID
  getById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  //Elimina un usuario por ID
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  //Lista todos los usuarios
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  // src/app/services/user-service.ts
  updatePassword(data: { oldPassword: string; newPassword: string }): Observable<void> {
    return this.getCurrentUser().pipe(
      switchMap((current) =>
        this.http.put<void>(`${this.baseUrl}/update-password`, {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        })
      )
    );
  }

}