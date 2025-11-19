import { Injectable, inject }                   from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { environment }                          from '../../environments/environment';
import   Habitacion                             from '../models/Habitacion';
import { catchError, Observable, throwError }   from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.API_BASE_URL}/api/empleados/habitaciones`;

  cambiarEstadoLimpieza(id: number): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}/estado-limpieza`, {});
  }

  cambiarEstadoMantenimiento(id: number): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}/estado-mantenimiento`, {});
  }

  restaurarEstado(id: number): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}/restaurar-estado`, {});
  }

  ponerDisponible(id: number): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}/estado-disponible`, {});
  }
}
