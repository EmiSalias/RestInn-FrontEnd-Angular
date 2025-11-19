import Huesped from '../models/Huesped';

export default interface ReservaRequest {
  fechaIngreso: string;             // YYYY-MM-DD
  fechaSalida: string;              // YYYY-MM-DD
  habitacionId: number;
  huespedes: Huesped[];
  fechaReserva?: string | null;     // YYYY-MM-DD
  estadoReserva?: string | null;
}