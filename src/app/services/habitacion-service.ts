import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Habitacion from '../models/Habitacion';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {

  private readonly http = inject(HttpClient)
  private readonly API_URL = `${environment.API_BASE_URL}/api/habitaciones`

  // GET /api/habitaciones
  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.API_URL).pipe(
      catchError(this.handleError)
    )
  }

  // GET /api/habitaciones/{id}
  getHabitacion(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  // POST /api/habitaciones
  postHabitacion(h: Habitacion): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.API_URL, h).pipe(
      catchError(this.handleError)
    )
  }

  // DELETE /api/habitaciones/{id}
  deleteHabitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  // PUT /api/habitaciones/{id}
  updateHabitacion(h: Habitacion): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${h.id}`, h).pipe(
      catchError(this.handleError)
    )
  }

  // PUT /api/habitaciones/{id}/borrar
  
  // PUT /api/habitaciones/{id}/activar

  // GET /api/habitaciones/reservables
  
  // GET /api/habitaciones/filtrar
  filtrarHabitaciones(params: any): Observable<Habitacion[]> {
  const url = `${this.API_URL}/filtrar`;
  return this.http.get<Habitacion[]>(url, { params });
  }
  
  // GET /api/habitaciones/disponibles
  
  // GET /api/habitaciones/admin/{id}

  // GET /api/habitaciones/admin/todas

  // Manejo centralizado de errores HTTP
  private handleError(error: any) {
    console.error('Error en HabitacionService:', error);
    return throwError(() => new Error('Ocurrió un error al procesar la solicitud.'));
  }
}
