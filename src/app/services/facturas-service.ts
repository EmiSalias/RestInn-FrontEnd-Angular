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

  getFacturaPorReserva(reservaId: number): Observable<FacturaResponseDTO> {
    return this.http.get<FacturaResponseDTO>(
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
