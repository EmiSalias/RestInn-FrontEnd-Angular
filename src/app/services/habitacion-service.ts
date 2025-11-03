import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Habitacion from '../models/Habitacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // hace que Angular lo registre solo
})
export class HabitacionService {

  private http = inject(HttpClient);

  // Base URL de la API de Spring (por ej. http://localhost:8081)
  private apiBaseUrl = environment.API_BASE_URL;

  /**
   * GET /api/habitaciones
   * Esto pega al endpoint público que devuelve las habitaciones activas.
   */
  getHabitacionesActivas(): Observable<Habitacion[]> {
    const url = `${this.apiBaseUrl}/api/habitaciones`;
    return this.http.get<Habitacion[]>(url);
  }

  /**
   * Ejemplo de otro posible método:
   * GET /api/habitaciones/{id}
   */
  getHabitacionById(id: number): Observable<Habitacion> {
    const url = `${this.apiBaseUrl}/api/habitaciones/${id}`;
    return this.http.get<Habitacion>(url);
  }

  // src/app/services/habitaciones.service.ts
getPorId(id: number) {
  return this.http.get<Habitacion>(`${this.apiBaseUrl}/habitaciones/${id}`);
}

}
