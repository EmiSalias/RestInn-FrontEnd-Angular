export default interface UsuarioRequest {
  nombre: string;
  apellido: string;
  nombreLogin: string;
  email: string;
  password: string;
  dni?: string;
  phoneNumber?: string;
  cuit?: string;
};