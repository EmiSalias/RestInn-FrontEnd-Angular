import ConsumoResponseDTO from '../models/ConsumoResponseDTO';

export default interface FacturaResponseDTO {
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