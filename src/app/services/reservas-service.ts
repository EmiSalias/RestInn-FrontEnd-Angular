import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Reserva from '../models/User';

@Injectable({ providedIn: 'root' })
export class ReservasService {

  private readonly baseUrl = environment.API_BASE_URL + '/api/reservas';

  constructor(private http: HttpClient) { }

  // Helper para encabezados con token
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') ?? '';
    const base: any = { 'Content-Type': 'application/json' };
    return new HttpHeaders(
      token ? { ...base, Authorization: `Bearer ${token}` } : base
    );
  }

  // #region CREAR / ACTUALIZAR / ELIMINAR

  // POST /api/reservas  (crea reserva como usuario autenticado)
  crearReserva(dto: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, dto, {
      headers: this.authHeaders()
    });
  }

  // PUT /api/reservas/{id}  (actualiza fechas/huespedes) 
  actualizarReserva(id: number, dto: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}`, dto, {
      headers: this.authHeaders()
    });
  }

  // DELETE /api/reservas/{id}  (CLIENTE cancela su propia reserva)
  cancelarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.authHeaders()
    });
  }

  // DELETE /api/reservas/administrador/{id}  (ADMIN elimina reserva)
  eliminarReservaAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/administrador/${id}`, {
      headers: this.authHeaders()
    });
  }
  // #endregion

  // #region CONSULTAS

  // GET /api/reservas/ocupadas?ingreso=YYYY-MM-DD&salida=YYYY-MM-DD
  getHabitacionesOcupadas(ingreso: string, salida: string): Observable<number[]> {
    const params = new HttpParams()
      .set('ingreso', ingreso)
      .set('salida', salida);

    return this.http.get<number[]>(`${this.baseUrl}/ocupadas`, { params });
  }

  // GET /api/reservas/mis-reservas  (cliente actual) 
  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/mis-reservas`, {
      headers: this.authHeaders()
    });
  }

  //  GET /api/reservas  (ADMIN / RECEPCIONISTA)
  getReservasAdmin(opts?: { estado?: string; reservaId?: number }): Observable<Reserva[]> {
    let params = new HttpParams();
    if (opts?.estado) params = params.set('estado', opts.estado);
    if (opts?.reservaId) params = params.set('reservaId', String(opts.reservaId));

    return this.http.get<Reserva[]>(this.baseUrl, {
      headers: this.authHeaders(),
      params
    });
  }

  // GET /api/reservas/{idCliente}  (reservas de un cliente, ADMIN / RECEPCIONISTA)
  getReservasPorCliente(clienteId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/${clienteId}`, {
      headers: this.authHeaders()
    });
  }


  // DETALLE DE UNA RESERVA POR ID
  getReservaDetalle(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(
      `${this.baseUrl}/detalle/${id}`,
      { headers: this.authHeaders() }
    );
  }
  // #endregion

  // #region ESTADO DE RESERVA (workflow)

  // POST /api/reservas/confirmar/{reservaId}
  confirmarReserva(reservaId: number): Observable<Reserva> {
    return this.http.post<Reserva>(
      `${this.baseUrl}/confirmar/${reservaId}`,
      {},
      { headers: this.authHeaders() }
    );
  }

  // POST /api/reservas/checkin/{reservaId}
  checkIn(reservaId: number): Observable<Reserva> {
    return this.http.post<Reserva>(
      `${this.baseUrl}/checkin/${reservaId}`,
      {},
      { headers: this.authHeaders() }
    );
  }

  // POST /api/reservas/checkout/{reservaId}
  checkOut(reservaId: number): Observable<Reserva> {
    return this.http.post<Reserva>(
      `${this.baseUrl}/checkout/${reservaId}`,
      {},
      { headers: this.authHeaders() }
    );
  }
  // #endregion
}
