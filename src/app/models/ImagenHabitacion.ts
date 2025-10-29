export default interface Imagen {
  id: number;
  nombre: string;
  tipo: string;
  datos: string; // viene como base64 del backend (el byte[])
}