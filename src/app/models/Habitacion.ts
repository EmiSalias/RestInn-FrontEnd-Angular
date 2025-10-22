import { H_Estado } from "../enums/H_Estado"
import { H_Tipo } from "../enums/H_Tipo"
import ImagenHabitacion from "./ImagenHabitacion"

export default interface Habitacion {
    id : string,
    activo : boolean,
    estado : H_Estado,
    tipo : H_Tipo,
    numero : number,
    piso : number,
    capacidad : number,
    cantCamas : number,
    precioNoche : number,
    comentario? : string,   // es opcional, ya que puede venir nulo
    imagenes : ImagenHabitacion[]   // lista de imagenes asociadas
}