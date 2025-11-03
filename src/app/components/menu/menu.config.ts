import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHome, faBed, faUtensils, faFileInvoice, faCalendarCheck, faUser } from '@fortawesome/free-solid-svg-icons';

export type Role = 'ADMINISTRADOR' | 'RECEPCIONISTA' | 'CONSERJE' | 'LIMPIEZA' | 'CLIENTE';
type Public = 'PUBLIC';

export interface MenuItem {
  label: string;
  icon?: IconDefinition;
  link?: any[] | string;                 // routerLink
  children?: MenuItem[];
  allowedRoles?: Role[] | Public;        // quién lo ve
  dynamicLink?: (ctx: { userId?: string | number }) => any[] | string; // para URLs con params
}

export const MENU: MenuItem[] = [
  { label: 'Inicio', icon: faHome, link: '/', allowedRoles: 'PUBLIC' },

  {
    label: 'Gestion de usuarios', icon: faUser,
    allowedRoles: ['ADMINISTRADOR'],
    children: [
      { label: 'Ver todas', link: '/listado_habitaciones', allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CONSERJE','LIMPIEZA'] },
      { label: 'Agregar nueva', link: '/crear_habitacion/form', allowedRoles: ['ADMINISTRADOR'] },
    ]
  },
  {
    label: 'Habitaciones', icon: faBed,
    allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CONSERJE','LIMPIEZA','CLIENTE'],
    children: [
      { label: 'Ver todas', link: '/listado_habitaciones', allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CONSERJE','LIMPIEZA'] },
      { label: 'Agregar nueva', link: '/crear_habitacion/form', allowedRoles: ['ADMINISTRADOR'] },
    ]
  },

  {
    label: 'Reservas', icon: faCalendarCheck,
    allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CLIENTE'],
    children: [
      { label: 'Ver reservas', link: '/listado_reservas', allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA'] },
      { label: 'Nueva reserva', link: '/crear_reserva/form', allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CLIENTE'] },
      // ejemplo de link dinámico con el id del cliente logueado
      { label: 'Mis reservas', allowedRoles: ['CLIENTE'], dynamicLink: ({userId}) => ['/mis_reservas', userId!] },
    ]
  },

  {
    label: 'Consumos', icon: faUtensils,
    allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CLIENTE'],
    children: [
      // Los que llevan :id los omitimos del menú a menos que tengas el id en contexto
      // { label: 'Listado por reserva', dynamicLink: ... }
    ]
  },

  {
    label: 'Facturación', icon: faFileInvoice,
    allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA','CLIENTE'],
    children: [
      { label: 'Ver facturas', link: '/listado_facturas', allowedRoles: ['ADMINISTRADOR','RECEPCIONISTA'] },
      // { label: 'Ver facturas por reserva', dynamicLink: ... }
    ]
  }
];
