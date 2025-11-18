import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura } from '../models/Factura';

@Injectable({ providedIn: 'root' })
export class FacturasService {

  private readonly baseUrl = environment.API_BASE_URL + '/api/facturas';

  constructor(private http: HttpClient) { }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') ?? '';
    return new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
  }

  listarTodas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.baseUrl, {
      headers: this.authHeaders()
    });
  }

  listarPorCliente(clienteId: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(
      `${this.baseUrl}/cliente/${clienteId}`,
      { headers: this.authHeaders() }
    );
  }

  listarMias(): Observable<Factura[]> {
    return this.http.get<Factura[]>(
      `${this.baseUrl}/mias`,
      { headers: this.authHeaders() }
    );
  }

  getFacturaPorReserva(reservaId: number): Observable<Factura> {
    return this.http.get<Factura>(
      `${this.baseUrl}/reserva/${reservaId}`,
      { headers: this.authHeaders() }
    );
  }

  descargarPdf(facturaId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/${facturaId}/pdf`,
      {
        headers: this.authHeaders(),
        responseType: 'blob'
      }
    );
  }

}
