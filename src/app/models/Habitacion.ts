import { H_Estado } from "./enums/H_Estado";
import { H_Tipo } from "./enums/H_Tipo";

export interface BackendImagen {
  id: number;
  nombre: string;
  tipo: string;
  datosBase64: string;
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
  imagenes: BackendImagen[];
}
