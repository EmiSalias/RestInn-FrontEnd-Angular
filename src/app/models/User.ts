export default interface User {
    id: string;
    nombre: string;
    apellido: string;
    nombreLogin: string;
    dni: string;
    phoneNumber: string;
    email?: string | null;
    cuit: string;
    activo: boolean;
    role: string;
    password?: string;
}