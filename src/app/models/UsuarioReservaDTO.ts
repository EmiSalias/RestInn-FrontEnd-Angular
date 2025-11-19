export default interface UsuarioReservaDTO {
  id: number;
  nombre: string;
  apellido: string;
  nombreLogin: string;
  role: string;
  email?: string | null;
}