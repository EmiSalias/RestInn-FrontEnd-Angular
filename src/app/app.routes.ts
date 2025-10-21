// #region ACCESO PÚBLICO - IMPORTS
import { Home } from './pages/home/home';
import { SignUpUsuario } from './pages/usuarios/sign-up-usuario/sign-up-usuario';
// #endregion
// #region Usuarios       - IMPORTS
import { ListadoUsuarios } from './pages/usuarios/listado-usuarios/listado-usuarios';
import { DetallesUsuario } from './pages/usuarios/detalles-usuario/detalles-usuario';
import { FormUsuario } from './pages/usuarios/form-usuario/form-usuario';
// #endregion
// #region Clientes       - IMPORTS
import { FormCliente } from './pages/usuarios/clientes/form-cliente/form-cliente';
import { DetallesCliente } from './pages/usuarios/clientes/detalles-cliente/detalles-cliente';
import { ListadoClientes } from './pages/usuarios/clientes/listado-clientes/listado-clientes';
// #endregion
// #region Habitaciones   - IMPORTS
import { ListadoHabitaciones } from './pages/habitaciones/listado-habitaciones/listado-habitaciones';
import { DetallesHabitacion } from './pages/habitaciones/detalles-habitacion/detalles-habitacion';
import { FormHabitacion } from './pages/habitaciones/form-habitacion/form-habitacion';
import { InhabilitarHabitacion } from './pages/habitaciones/inhabilitar-habitacion/inhabilitar-habitacion';
// #endregion
// #region Reservas       - IMPORTS
import { ListadoReservas } from './pages/reservas/listado-reservas/listado-reservas';
import { DetallesReserva } from './pages/reservas/detalles-reserva/detalles-reserva';
import { FormReserva } from './pages/reservas/form-reserva/form-reserva';
import { ReservasCliente } from './pages/reservas/reservas-cliente/reservas-cliente';
// #endregion
// #region Consumos       - IMPORTS
import { ListadoConsumos } from './pages/consumos/listado-consumos/listado-consumos';
import { FormConsumo } from './pages/consumos/form-consumo/form-consumo';
// #endregion
// #region Facturación    - IMPORTS
import { FacturaReserva } from './pages/facturaciones/factura-reserva/factura-reserva';
import { ListadoFacturas } from './pages/facturaciones/listado-facturas/listado-facturas';
import { DetalleFactura } from './pages/facturaciones/detalle-factura/detalle-factura';
import { CambiarEstadoFactura } from './pages/facturaciones/cambiar-estado-factura/cambiar-estado-factura';
// #endregion
// #region Perfil         - IMPORTS
import { PerfilUsuario } from './pages/usuarios/perfil-usuario/perfil-usuario';
import { EditarPerfilUsuario } from './pages/usuarios/editar-perfil-usuario/editar-perfil-usuario';
// #endregion
import { Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { PrivacyPolicyComponent } from './pages/normasLegales/privacy-policy-component/privacy-policy-component';
import { TermsConditionsComponent } from './pages/normasLegales/terms-conditions-component/terms-conditions-component';
import { CancelPolicyComponent } from './pages/normasLegales/cancel-policy-component/cancel-policy-component';
import { CookiesPolicyComponent } from './pages/normasLegales/cookies-policy-component/cookies-policy-component';
import { Nosotros } from './pages/nosotros/nosotros';
import { Contact } from './pages/contact/contact';



export const routes: Routes = [
    // #region ACCESO PÚBLICO
    {
        path:'',
        component: Home
    },
    {
        path: 'sign_in',
        component: SignUpUsuario
    },
    // #endregion


    // #region Usuarios - CRUD
    {
        path: 'listado_usuarios',
        component: ListadoUsuarios,
        canActivate: [AuthGuard],
        data: {
            roles: ['admin']
        }
    },
    {
        path: 'usuario/:id',
        component: DetallesUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: ['admin']
        }
    },
    {
        path: 'crear_usuario/form',
        component: FormUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: ['admin']
        }
    },
    {
        path: 'editar_usuario/:id',
        component: FormUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: ['admin']
        }
    },
    // #endregion


    // #region Clientes - CRUD
    {
        path: 'listado_clientes',
        component: ListadoClientes,
        canActivate: [AuthGuard],
        data: {
            roles: ['recepcionista']
        }
    },
    { path: 'cliente/:id',
        component: DetallesCliente,
        canActivate: [AuthGuard],
        data: {
            roles: ['recepcionista']
        }
    },
    {
        path: 'crear_cliente/form',
        component: FormCliente,
        canActivate: [AuthGuard],
        data: {
            roles: ['recepcionista']
        }
    },
    {
        path: 'editar_cliente/:id',
        component: FormCliente,
        canActivate: [AuthGuard],
        data: {
            roles: ['recepcionista']
        }
    },
    // #endregion


    // #region Habitaciones - CRUD
    { path: 'listado_habitaciones',
        component: ListadoHabitaciones,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'conserje',
                'limpieza'
            ]
        }
    },
    {
        path: 'habitacion/:id',
        component: DetallesHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'conserje',
                'limpieza',
                'cliente'
            ]
        }
    },
    {
        path: 'crear_habitacion/form',
        component: FormHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: ['admin']
        }
    },
    {
        path: 'editar_habitacion/:id',
        component: FormHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: ['admin']
        }
    },
    {
        path: 'inhabilitar_habitacion/:id',
        component: InhabilitarHabitacion,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'conserje',
                'limpieza'
            ]
        }
    },
    // #endregion


    // #region Reservas - CRUD
    {
        path: 'listado_reservas',
        component: ListadoReservas,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista'
            ]
        }
    },
    {
        path: 'reserva/:id',
        component: DetallesReserva,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'cliente'
            ]
        }
    },
    {
        path: 'crear_reserva/form',
        component: FormReserva,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'cliente'
            ]
        }
    },
    {
        path: 'editar_reserva/:id',
        component: FormReserva,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista'
            ]
        }
    },
    {
        path: 'mis_reservas/:id',
        component: ReservasCliente,
        canActivate: [AuthGuard],
        data: {
            roles: ['cliente']
        }
    },
    // #endregion


    // #region Consumos - CRUD
    {
        path: 'consumos_reserva/:id',
        component: ListadoConsumos,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'cliente'
            ]
        }
    },
    {
        path: 'crear_consumo/form/:reservaId',
        component: FormConsumo,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista'
            ]
        }
    },
    {
        path: 'editar_consumo/:id',
        component: FormConsumo,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista'
            ]
        }
    },
    // #endregion


    // #region Facturación
    {
        path: 'facturas_reserva/:id',
        component: FacturaReserva,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'cliente'
            ]
        }
    },
    {
        path: 'listado_facturas',
        component: ListadoFacturas,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista'
            ]
        }
    },
    {
        path: 'factura/:id',
        component: DetalleFactura,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'cliente'
            ]
        }
    },
    {
        path: 'cambiar_estado_factura/:id',
        component: CambiarEstadoFactura,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista'
            ]
        }
    },
    // #endregion


    // #region Perfil
    { path: 'mi_perfil',
        component: PerfilUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'conserje',
                'limpieza',
                'cliente'
            ]
        }
    },
    {
        path: 'editar_perfil',
        component: EditarPerfilUsuario,
        canActivate: [AuthGuard],
        data: {
            roles: [
                'admin',
                'recepcionista',
                'conserje',
                'limpieza',
                'cliente'
            ]
        }
    },
    // #endregion


    // #region Footer
    {
        path: 'nosotros',
        component: Nosotros
    },
    {
        path: 'politica-privacidad',
        component: PrivacyPolicyComponent
    },
    {
        path: 'politica-cancelacion',
        component: CancelPolicyComponent
    },
    {
        path: 'politica-cookies',
        component: CookiesPolicyComponent
    },
    {
        path: 'terminos-condiciones',
        component: TermsConditionsComponent
    },
    {
        path: 'contacto',
        component: Contact
    },
    // #endregion


    // #region Errores
    {
        path: '',
        redirectTo: '/',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: ''
    }
    // #endregion
];
