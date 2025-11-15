import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHome,
  faBed,
  faUtensils,
  faFileInvoice,
  faCalendarCheck,
  faUser
} from '@fortawesome/free-solid-svg-icons';

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
    label: 'Gestion de usuarios',
    icon: faUser,
    link: '/gestion_usuarios',
    allowedRoles: ['ADMINISTRADOR'],
  },

  {
    label: 'Habitaciones',
    icon: faBed,
    allowedRoles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA', 'CLIENTE'],
    children: [
      {
        label: 'Ver todas',
        link: '/listado_habitaciones',
        allowedRoles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA']
      },
      {
        label: 'Agregar nueva',
        link: '/crear_habitacion/form',
        allowedRoles: ['ADMINISTRADOR']
      },
    ]
  },

  // === HUB solo para ADMIN / RECEPCIONISTA ===
  {
    label: 'Gestión de reservas',
    icon: faCalendarCheck,
    link: '/gestion_reservas',
    allowedRoles: ['ADMINISTRADOR', 'RECEPCIONISTA']
  },

  // === Menú clásico de reservas solo para CLIENTE ===
  {
    label: 'Reservas',
    icon: faCalendarCheck,
    allowedRoles: ['CLIENTE'],
    children: [
      {
        label: 'Ver reservas',
        link: '/mis_reservas',
        allowedRoles: ['CLIENTE']
      },
      {
        label: 'Nueva reserva',
        link: '/crear_reserva',
        allowedRoles: ['CLIENTE']
      }
    ]
  },

  {
    label: 'Consumos',
    icon: faUtensils,
    allowedRoles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'],
    children: [
      // { label: 'Listado por reserva', dynamicLink: ... }
    ]
  },

  {
    label: 'Facturación',
    icon: faFileInvoice,
    allowedRoles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'],
    children: [
      {
        label: 'Ver facturas',
        link: '/listado_facturas',
        allowedRoles: ['ADMINISTRADOR', 'RECEPCIONISTA']
      }
    ]
  }
];
