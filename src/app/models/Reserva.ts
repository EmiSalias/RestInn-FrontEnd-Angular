import User from './User';
import Huesped from './User';

export interface Reserva {
  id: number;
  huespedes?: Huesped[];
  fechaIngreso: string;   // YYYY-MM-DD
  fechaSalida: string;    // YYYY-MM-DD
  estado: string;
  habitacionId: number;
  habitacionNumero?: number;
  usuario: User;
  fechaReserva?: string | null;
  estadoReserva?: string | null;
}