import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import FacturaResponseDTO from '../models/FacturaResponseDTO';
import FacturaPagarRequestDTO from '../models/FacturaPagarRequestDTO';
import ResumenFacturacionClienteDTO from '../models/ResumenFacturacionClienteDTO';
import FacturaReservaInfoDTO from '../models/FacturaReservaInfoDTO';

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

  listarTodas(): Observable<FacturaResponseDTO[]> {
    return this.http.get<FacturaResponseDTO[]>(this.baseUrl, {
      headers: this.authHeaders()
    });
  }

  listarPorCliente(clienteId: number): Observable<FacturaResponseDTO[]> {
    return this.http.get<FacturaResponseDTO[]>(
      `${this.baseUrl}/cliente/${clienteId}`,
      { headers: this.authHeaders() }
    );
  }

  listarMias(): Observable<FacturaResponseDTO[]> {
    return this.http.get<FacturaResponseDTO[]>(
      `${this.baseUrl}/mias`,
      { headers: this.authHeaders() }
    );
  }

  /** Factura de tipo RESERVA asociada a una reserva */
  getFacturaPorReserva(reservaId: number): Observable<FacturaResponseDTO> {
    return this.http.get<FacturaResponseDTO>(
      `${this.baseUrl}/reserva/${reservaId}`,
      { headers: this.authHeaders() }
    );
  }

  /** Obtener una factura por su ID */
  getFacturaPorId(facturaId: number): Observable<FacturaResponseDTO> {
    return this.http.get<FacturaResponseDTO>(
      `${this.baseUrl}/${facturaId}`,
      { headers: this.authHeaders() }
    );
  }

  /** Marcar la factura de RESERVA como PAGADA (pago en efectivo por ahora) */
  pagarFacturaReserva(
    reservaId: number,
    dto: FacturaPagarRequestDTO = { metodoPago: 'EFECTIVO', cuotas: 1 }
  ): Observable<FacturaResponseDTO> {
    return this.http.post<FacturaResponseDTO>(
      `${this.baseUrl}/reserva/${reservaId}/pagar`,
      dto,
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

  resumenMias(): Observable<ResumenFacturacionClienteDTO> {
    return this.http.get<ResumenFacturacionClienteDTO>(
      `${this.baseUrl}/mias/resumen`,
      { headers: this.authHeaders() }
    );
  }

  pagarFacturaPorId(
    facturaId: number,
    dto: FacturaPagarRequestDTO = { metodoPago: 'EFECTIVO', cuotas: 1 }
  ): Observable<FacturaResponseDTO> {
    return this.http.post<FacturaResponseDTO>(
      `${this.baseUrl}/${facturaId}/pagar`,
      dto,
      { headers: this.authHeaders() }
    );
  }

  getInfoFacturaReserva(reservaId: number): Observable<FacturaReservaInfoDTO> {
    return this.http.get<FacturaReservaInfoDTO>(
      `${this.baseUrl}/reserva/${reservaId}/info`,
      { headers: this.authHeaders() }
    );
  }
  
  listarReservasFinalizadasImpagas(): Observable<FacturaReservaInfoDTO[]> {
    return this.http.get<FacturaReservaInfoDTO[]>(
      `${this.baseUrl}/reservas-finalizadas-impagas`,
      { headers: this.authHeaders() }
    );
  }

}
