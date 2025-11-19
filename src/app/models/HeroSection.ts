export type HeroKey =
  | 'default'
  | 'reservas'
  | 'habitaciones'
  | 'historial'
  | 'favoritos'
  | 'facturacion'
  | 'adminUsuarios'
  | 'adminHabitaciones'
  | 'adminReservas'
  | 'adminFacturacion';

export default interface HeroSection {
  key: HeroKey;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
}