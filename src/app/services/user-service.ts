import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import User from '../models/User';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.API_BASE_URL + '/api/usuarios';
  private readonly adminBaseUrl = environment.API_BASE_URL + '/api/admin/usuarios';

  // Obtiene el usuario actualmente autenticado
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/current`);
  }

  // Actualiza los datos del usuario autenticado
  updateCurrentUser(data: Partial<User>): Observable<void> {
    return this.getCurrentUser().pipe(
      switchMap((current) =>
        this.http.put<void>(`${this.baseUrl}/${current.id}`, data)
      )
    );
  }

  // Obtiene un usuario por ID
  getById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // Obtiene un empleado por ID
  getEmployeeById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.adminBaseUrl}/empleados/${id}`);
  }

  // Elimina un usuario por ID
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Lista todos los usuarios
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  // Actualiza la contraseña del usuario autenticado
  updatePassword(data: { oldPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/update-password`, data);
  }

  // Crea un nuevo empleado
  createEmployee(data: any): Observable<User> {
    return this.http.post<User>(`${this.adminBaseUrl}/empleados`, data);
  }

  // Obtiene todos los empleados
  getAllEmpleados(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminBaseUrl}/empleados`).pipe(
      tap((response) => console.log('Empleados recibidos:', response))
    );
  }

  // Borrado lógico de un empleado (marcar como inactivo)
  borrarLogicoEmpleado(id: string | number): Observable<void> {
    return this.http.put<void>(`${this.adminBaseUrl}/empleados/${id}/borrado-logico`, {});
  }

  // Método para activar a un empleado
  activateEmployee(id: string | number): Observable<void> {
    return this.http.put<void>(`${this.adminBaseUrl}/empleados/${id}/activarEmpleado`, {});
  }

  // Actualiza los datos de un empleado
  updateEmployee(id: string, data: any): Observable<User> {
    return this.http.put<User>(`${this.adminBaseUrl}/empleados/${id}`, data);
  }
  // src/app/services/user-service.ts

  resetEmployeePassword(id: string | number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.adminBaseUrl}/empleados/${id}/reset-password`, {
      newPassword
    });
  }

  

}