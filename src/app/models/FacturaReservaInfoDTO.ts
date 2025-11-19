export default interface FacturaReservaInfoDTO {
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