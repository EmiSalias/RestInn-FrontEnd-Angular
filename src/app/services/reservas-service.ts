import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface HuespedRequest {
  nombre: string;
  apellido: string;
  dni: string;
}

export interface ReservaRequest {
  fechaIngreso: string;   // YYYY-MM-DD
  fechaSalida: string;    // YYYY-MM-DD
  habitacionId: number;
  huespedes: HuespedRequest[];
  fechaReserva?: string | null;
  estadoReserva?: string | null;
}

export interface ReservaResponse {
  id: number;
  // si querés, agregá el resto de los campos del DTO
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly baseUrl = environment.API_BASE_URL + '/api/reservas';

  constructor(private http: HttpClient) {}

  crearReserva(dto: ReservaRequest): Observable<ReservaResponse> {
    const token = localStorage.getItem('access_token') ?? '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return this.http.post<ReservaResponse>(this.baseUrl, dto, { headers });
  }
  
  getHabitacionesOcupadas(ingreso: string, salida: string): Observable<number[]> {
    const params = new HttpParams().set('ingreso', ingreso).set('salida', salida);
    return this.http.get<number[]>(`${this.baseUrl}/ocupadas`, { params });
  }
  
}
