// src/app/services/facturas-service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConsumoResponseDTO {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ResumenFacturacionClienteDTO {
  saldoPendiente: number;
  saldoPagado: number;
  facturasPendientes: number;
  facturasPagadas: number;
}

// Info resumida de factura de RESERVA para una reserva concreta
export interface FacturaReservaInfoDTO {
  reservaId: number;
  fechaIngreso: string;
  fechaSalida: string;
  estadoReserva: string;
  facturaId: number;
  estadoFactura: string;
  tipoFactura: string;
  totalFinal: number;
  clienteNombre: string;
  clienteApellido: string;
  clienteEmail: string;
  clienteDni: string;
}

export interface FacturaResponseDTO {
  id: number;
  clienteNombre: string;
  ingreso: string;
  salida: string;
  habitacionNumero: string;
  reservaId: number;
  fechaEmision: string;
  tipoFactura: string;
  estado: string;
  subtotal: number;
  metodoPago: string;
  cuotas: number;
  descuento: number;
  interes: number;
  totalFinal: number;
  consumos?: ConsumoResponseDTO[];
}

export interface FacturaPagarRequestDTO {
  metodoPago: 'EFECTIVO' | 'CREDITO';
  cuotas: number;
}

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


}
