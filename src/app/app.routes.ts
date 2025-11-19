// region Acceso público - IMPORTS
import { Home } from './pages/home/home';
import { SignUp } from './pages/usuarios/sign-up/sign-up';
import { SignIn } from './pages/usuarios/sign-in/sign-in';
// #endregion
// region Usuarios       - IMPORTS
import { DetallesUsuario } from './pages/usuarios/detalles-usuario/detalles-usuario';
import { FormUsuario } from './pages/usuarios/form-usuario/form-usuario';
// #endregion
// region CLIENTEs       - IMPORTS
import { ListadoEmpleados } from './pages/usuarios/empleados/listado-empleados/listado-empleados';
import { FormEmpleado } from './pages/usuarios/empleados/form-empleado/form-empleado';
// #endregion
// region EMPLEADOS       - IMPORTS
import { FormCliente } from './pages/usuarios/clientes/form-cliente/form-cliente';
import { ListadoClientes } from './pages/usuarios/clientes/listado-clientes/listado-clientes';
import { CheckInOut } from './pages/usuarios/empleados/check-in-out/check-in-out';
// #endregion

// region Habitaciones   - IMPORTS
import { ListadoHabitaciones } from './pages/habitaciones/listado-habitaciones/listado-habitaciones';
import { DetallesHabitacion } from './pages/habitaciones/detalles-habitacion/detalles-habitacion';
import { FormHabitacion } from './pages/habitaciones/form-habitacion/form-habitacion';
import { InhabilitarHabitacion } from './pages/habitaciones/inhabilitar-habitacion/inhabilitar-habitacion';
import { GestionHabitaciones } from './pages/habitaciones/gestion-habitaciones/gestion-habitaciones';
// #endregion
// region Reservas       - IMPORTS
import { ListadoReservas } from './pages/reservas/listado-reservas/listado-reservas';
import { DetallesReserva } from './pages/reservas/detalles-reserva/detalles-reserva';
import { FormReserva } from './pages/reservas/form-reserva/form-reserva';
import { CrearReservaBusqueda } from './pages/reservas/crear-reserva-busqueda/crear-reserva-busqueda';
// #endregion
// region Consumos       - IMPORTS
import { ListadoConsumos } from './pages/consumos/listado-consumos/listado-consumos';
import { FormConsumo } from './pages/consumos/form-consumo/form-consumo';
// #endregion
// region Facturación    - IMPORTS
import { FacturaReserva } from './pages/facturaciones/factura-reserva/factura-reserva';
import { ListadoFacturas } from './pages/facturaciones/listado-facturas/listado-facturas';
import { DetalleFactura } from './pages/facturaciones/detalle-factura/detalle-factura';
import { CambiarEstadoFactura } from './pages/facturaciones/cambiar-estado-factura/cambiar-estado-factura';
// #endregion
// region Perfil         - IMPORTS
import { PerfilUsuario } from './pages/usuarios/perfil-usuario/perfil-usuario';
import { EditarPerfilUsuario } from './pages/usuarios/editar-perfil-usuario/editar-perfil-usuario';
// #endregion
// region Normas         - IMPORTS
import { PrivacyPolicy } from './pages/User-Policy/privacy-policy/privacy-policy';
import { CancelPolicy } from './pages/User-Policy/cancel-policy/cancel-policy';
import { CookiesPolicy } from './pages/User-Policy/cookies-policy/cookies-policy'; import { TermsConditions } from './pages/User-Policy/terms-conditions/terms-conditions';
import { Nosotros } from './pages/nosotros/nosotros';
import { Contact } from './pages/contact/contact';
// #endregion
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { Unauthorized } from './pages/usuarios/unauthorized/unauthorized';
import { GestionReservas } from './pages/reservas/gestion-reservas/gestion-reservas';

export const routes: Routes = [

    // region Acceso público
    { path: '', component: Home },
    { path: 'sign_in', component: SignIn },
    { path: 'sign_up', component: SignUp },
    { path: 'recovery', loadComponent: () => import('./pages/usuarios/recovery/recovery').then(m => m.Recovery) },
    // endregion

    // region Usuarios - CRUD
    {
        path: 'gestion_usuarios',
        loadComponent: () =>
            import('./pages/usuarios/gestion-usuarios/gestion-usuarios')
                .then(m => m.GestionUsuarios)
    },
    {
        path: 'listado_clientes',
        loadComponent: () =>
            import('./pages/usuarios/clientes/listado-clientes/listado-clientes')
                .then(m => m.ListadoClientes)
    },
    {
        path: 'listado_empleados',
        component: ListadoEmpleados,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    {
        path: 'usuario/:id',
        component: DetallesUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE']
        }
    },
    {
        path: 'form_empleado/:id',
        component: FormEmpleado,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    {
        path: 'form_empleado',
        component: FormEmpleado,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    {
        path: 'editar_usuario/:id',
        component: FormUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    // #endregion

    // region CLIENTES - CRUD
    {
        path: 'listado_CLIENTEs',
        component: ListadoClientes,
        canActivate: [AuthGuard],
        data: {
            roles: ['RECEPCIONISTA']
        }
    },
    {
        path: 'crear_CLIENTE/form',
        component: FormCliente,
        canActivate: [AuthGuard],
        data: {
            roles: ['RECEPCIONISTA']
        }
    },
    {
        path: 'editar_CLIENTE/:id',
        component: FormCliente,
        canActivate: [AuthGuard],
        data: {
            roles: ['RECEPCIONISTA']
        }
    },
    // endregion

    // region Habitaciones - CRUD
    {
        path: 'listado_habitaciones',
        component: ListadoHabitaciones
    },
    {
        path: 'habitacion/:id',
        component: DetallesHabitacion
    },

    {
        path: 'crear_habitacion/form',
        component: FormHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    {
        path: 'editar_habitacion/:id',
        component: FormHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    {
        path: 'gestion_habitaciones',
        component: GestionHabitaciones,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR']
        }
    },
    {
        path: 'inhabilitar_habitacion/:id',
        component: InhabilitarHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA',
                'CONSERJE',
                'LIMPIEZA'
            ]
        }
    },
    // endregion

    // region Reservas - CRUD

    { path: 'crear_reserva', component: CrearReservaBusqueda },

    // === ADMIN / RECEPCIONISTA: hub de gestión ===
    {
        path: 'gestion_reservas',
        component: GestionReservas,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA']
        }
    },

    {
        path: 'check_in_out',
        component: CheckInOut,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA']
        }
    },

    // === ADMIN / RECEPCIONISTA: historial (listado reactivo) ===
    {
        path: 'listado_reservas',
        component: ListadoReservas,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA'],
            modo: 'admin'
        }
    },

    // === CLIENTE: mis reservas (mismo componente, modo cliente) ===
    {
        path: 'mis_reservas',
        component: ListadoReservas,
        canActivate: [AuthGuard],
        data: {
            roles: ['CLIENTE'],
            modo: 'cliente'
        }
    },

    // Detalle
    {
        path: 'reserva/:id',
        component: DetallesReserva,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE']
        }
    },

    // Crear / editar reserva
    {
        path: 'crear_reserva/form',
        component: FormReserva,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE']
        }
    },
    {
        path: 'editar_reserva/:id',
        component: FormReserva,
        canActivate: [AuthGuard],
        data: {
            roles: ['ADMINISTRADOR', 'RECEPCIONISTA']
        }
    },
    // endregion

    // region Consumos - CRUD
    {
        path: 'consumos_reserva/:id',
        component: ListadoConsumos,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA',
                'CLIENTE'
            ]
        }
    },
    {
        path: 'crear_consumo/form/:reservaId',
        component: FormConsumo,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA'
            ]
        }
    },
    {
        path: 'editar_consumo/:id',
        component: FormConsumo,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA'
            ]
        }
    },
    // #endregion

    // region Facturación
    {
        path: 'facturas_reserva/:id',
        component: FacturaReserva,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA',
                'CLIENTE'
            ]
        }
    },
    {
        path: 'listado_facturas',
        component: ListadoFacturas,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA',
                'CLIENTE'
            ]
        }
    },

    {
        path: 'detalle_factura/:id',
        component: DetalleFactura,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA',
                'CLIENTE'
            ]
        }
    },
    {
        path: 'cambiar_estado_factura/:id',
        component: CambiarEstadoFactura,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA'
            ]
        }
    },
    // #endregion

    // region Perfil
    {
        path: 'mi_perfil',
        component: FormUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'ADMINISTRADOR',
                'RECEPCIONISTA',
                'CONSERJE',
                'LIMPIEZA',
                'CLIENTE'
            ]
        }
    },
    // si alguien entra a /editar_perfil desde un link viejo, lo mandamos al nuevo
    {
        path: 'editar_perfil',
        redirectTo: 'mi_perfil',
    },
    // #endregion

    // region Footer
    {
        path: 'nosotros',
        component: Nosotros
    },
    {
        path: 'politica-privacidad',
        component: PrivacyPolicy
    },
    {
        path: 'politica-cancelacion',
        component: CancelPolicy
    },
    {
        path: 'politica-cookies',
        component: CookiesPolicy
    },
    {
        path: 'terminos-condiciones',
        component: TermsConditions
    },
    {
        path: 'contacto',
        component: Contact
    },
    // #endregion

    // region Errores
    {
        path: '',
        redirectTo: '/',
        pathMatch: 'full'
    },
    {
        path: 'unauthorized',
        component: Unauthorized
    },
    {
        path: '**',
        redirectTo: ''
    }

    // #endregion
];
