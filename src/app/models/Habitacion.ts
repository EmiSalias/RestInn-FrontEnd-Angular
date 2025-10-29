import { H_Estado } from "../enums/H_Estado";
import { H_Tipo } from "../enums/H_Tipo";

// Tiene que matchear el DTO ImagenBase64DTO del backend
export interface BackendImagen {
  id: number;
  nombre: string;
  tipo: string;          // ej: "image/png"
  datosBase64: string;   // string base64 listo para <img src="data:...">
}

export default interface Habitacion {
  id: number;
  activo: boolean | null;
  estado: H_Estado;
  tipo: H_Tipo;
  numero: number;
  piso: number;
  capacidad: number;
  cantCamas: number;
  precioNoche: number;
  comentario?: string | null;
  imagenes: BackendImagen[]; // ahora es lista de DTOs ya serializados
}
