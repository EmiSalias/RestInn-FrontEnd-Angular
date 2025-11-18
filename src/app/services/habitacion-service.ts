import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Habitacion from '../models/Habitacion';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {

  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.API_BASE_URL}/api/habitaciones`;

  // GET /api/habitaciones (Listar solo activas)
  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/habitaciones/{id} (Buscar solo activas)
  getHabitacion(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/habitaciones/admin/todas (Listar activas e inactivas)
  listarTodasIncluidasInactivas(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.API_URL}/admin/todas`).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/habitaciones/admin/{id} (Buscar activas e inactivas)
  getHabitacionAdmin(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.API_URL}/admin/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/habitaciones
  postHabitacion(h: Habitacion): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.API_URL, h).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /api/habitaciones/{id}
  updateHabitacion(h: Habitacion): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${h.id}`, h).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /api/habitaciones/{id}/borrar (Inhabilitar)
  inhabilitarHabitacion(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/borrar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /api/habitaciones/{id}/activar (Reactivar)
  reactivarHabitacion(id: number): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}/activar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/habitaciones/filtrar
  filtrarPorAtributos(filtros: any): Observable<Habitacion[]> {
    let params = new HttpParams();

    if (filtros.estado) {
      params = params.set('tipo', filtros.estado);
    }
    if (filtros.capacidadMin) {
      params = params.set('capacidad', filtros.capacidadMin.toString());
    }
    if (filtros.precioMax) {
      params = params.set('precioNoche', filtros.precioMax.toString());
    }

    const url = `${this.API_URL}/filtrar`;
    return this.http.get<Habitacion[]>(url, { params }).pipe(
      catchError(this.handleError)
    );
  }
  
  // GET /api/habitaciones/disponibles
  getHabitacionesDisponibles(desde: string, hasta: string): Observable<Habitacion[]> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    const url = `${this.API_URL}/disponibles`;
    return this.http.get<Habitacion[]>(url, { params }).pipe( 
      catchError(this.handleError)
    );
  }

  // Manejo de errores HTTP
  private handleError(error: any) {
    console.error('Error en HabitacionService:', error);
    if (error.error && typeof error.error === 'string') {
      return throwError(() => new Error(error.error));
    }
    return throwError(() => new Error('Ocurrió un error al procesar la solicitud.'));
  }
}