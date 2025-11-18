// src/app/pages/reservas/listado-reservas/listado-reservas.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReservasService, ReservaResponse } from '../../../services/reservas-service';
import Habitacion from '../../../models/Habitacion';
import { HabitacionService } from '../../../services/habitacion-service';
import { AuthService } from '../../../services/auth-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listado-reservas.html',
  styleUrl: './listado-reservas.css'
})
export class ListadoReservas implements OnInit {

  private habSrv = inject(HabitacionService);
  private reservasSrv = inject(ReservasService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // modo de uso
  modoAdmin = false;
  titulo = '';
  subtitulo = '';

  habitacionesMap = new Map<number, Habitacion>();
  reservas: ReservaResponse[] = [];
  reservasFiltradas: ReservaResponse[] = [];

  defaultRoomImg = 'assets/images/habitaciones/placeholder-room.jpg';

  loading = false;
  errorMsg: string | null = null;

  // Combo de clientes únicos (solo tiene sentido en admin)
  clientesUnicos: { id: number; nombre: string }[] = [];

  filtros = {
    estado: '',
    rolUsuario: '',
    clienteId: null as number | null,
    fechaDesde: '',
    fechaHasta: '',
    search: ''
  };

  orden: 'ingresoDesc' | 'ingresoAsc' | 'estado' = 'ingresoDesc';

  // =======================
  //  HELPER ERRORES
  // =======================
  private getBackendErrorMessage(err: any, fallback: string): string {
    const httpErr = err as any;

    if (!httpErr || httpErr.status === 0) {
      return 'No se pudo conectar con el servidor. Intentalo de nuevo más tarde.';
    }

    const body = httpErr.error;

    if (typeof body === 'string') {
      return body || fallback;
    }

    if (body) {
      if (body.mensaje) return body.mensaje;
      if (body.message) return body.message;
      if (body.detail) return body.detail;
    }

    if (httpErr.status >= 500) {
      return 'Error interno del servidor';
    }

    return fallback;
  }

  // =======================
  //       INIT
  // =======================
  ngOnInit(): void {
    const modoRuta = this.route.snapshot.data['modo'] as 'admin' | 'cliente' | undefined;

    const esAdminRecep = this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA']);
    const esCliente = this.auth.hasAnyRole(['CLIENTE']);

    // 1) Si la ruta fuerza modo admin/cliente, validamos rol
    if (modoRuta === 'admin') {
      if (!esAdminRecep) {
        return this.irUnauthorized();
      }
      this.modoAdmin = true;
      this.titulo = 'Reservas';
      this.subtitulo = 'Revisá y filtrá todas las reservas del sistema.';
      this.cargarReservasAdmin();
    } else if (modoRuta === 'cliente') {
      if (!esCliente) {
        return this.irUnauthorized();
      }
      this.modoAdmin = false;
      this.titulo = 'Mis reservas';
      this.subtitulo = 'Revisá el estado de tus reservas y consultá el detalle.';
      this.cargarMisReservas();
    } else {
      // 2) Sin modo en la ruta: decidimos según rol
      if (esAdminRecep) {
        this.modoAdmin = true;
        this.titulo = 'Reservas';
        this.subtitulo = 'Revisá y filtrá todas las reservas del sistema.';
        this.cargarReservasAdmin();
      } else if (esCliente) {
        this.modoAdmin = false;
        this.titulo = 'Mis reservas';
        this.subtitulo = 'Revisá el estado de tus reservas y consultá el detalle.';
        this.cargarMisReservas();
      } else {
        // 3) No es admin, ni recepcionista, ni cliente => fuera
        return this.irUnauthorized();
      }
    }

    // Solo llegamos acá si el usuario está autorizado
    this.cargarHabitaciones();
  }

  // =======================
  //  REDIRECCIÓN UNAUTHORIZED
  // =======================
  private irUnauthorized(): void {
    this.router.navigate(['/unauthorized']);
  }

  // =======================
  //    ADMIN / RECEPCIÓN
  // =======================
  private cargarReservasAdmin(): void {
    this.loading = true;
    this.errorMsg = null;

    this.reservasSrv.getReservasAdmin().subscribe({
      next: (data) => {
        this.reservas = data ?? [];
        this.armarClientesUnicos();
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error obteniendo reservas', err);
        this.errorMsg = err?.error?.message || 'No se pudieron cargar las reservas.';
        this.loading = false;
      }
    });
  }

  // =======================
  //        CLIENTE
  // =======================
  private cargarMisReservas(): void {
    this.loading = true;
    this.errorMsg = null;

    this.reservasSrv.getMisReservas().subscribe({
      next: (data) => {
        this.reservas = data ?? [];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error obteniendo reservas del cliente', err);
        this.errorMsg = err?.error?.message || 'No se pudieron cargar tus reservas.';
        this.loading = false;
      }
    });
  }

  // =======================
  //   FILTROS / ORDEN
  // =======================

  private armarClientesUnicos(): void {
    const mapa = new Map<number, string>();

    for (const r of this.reservas) {
      const u = r.usuario;
      if (u && u.id != null) {
        const nombre = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim();
        mapa.set(u.id, nombre || u.nombreLogin);
      }
    }

    this.clientesUnicos = Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      rolUsuario: '',
      clienteId: null,
      fechaDesde: '',
      fechaHasta: '',
      search: ''
    };
    this.orden = 'ingresoDesc';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const { estado, rolUsuario, clienteId, fechaDesde, fechaHasta, search } = this.filtros;

    let dDesde = fechaDesde ? new Date(fechaDesde) : null;
    let dHasta = fechaHasta ? new Date(fechaHasta) : null;
    const termino = search.trim().toLowerCase();

    const claveRolFiltro = this.normalizarRol(rolUsuario);

    if (dDesde && dHasta && dHasta < dDesde) {
      const tmp = dDesde;
      dDesde = dHasta;
      dHasta = tmp;
    }

    this.reservasFiltradas = this.reservas.filter(r => {
      const fIng = new Date(r.fechaIngreso);
      const fSal = new Date(r.fechaSalida);

      if (dDesde && fIng < dDesde) return false;

      if (dHasta) {
        const h = new Date(dHasta);
        h.setHours(23, 59, 59, 999);
        if (fSal > h) return false;
      }

      if (estado && r.estado !== estado) return false;

      if (this.modoAdmin && claveRolFiltro) {
        const rolReserva = this.normalizarRol(r.usuario?.role);
        if (rolReserva !== claveRolFiltro) return false;
      }

      if (this.modoAdmin && clienteId && r.usuario?.id !== clienteId) return false;

      if (termino) {
        const nom = `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''}`.toLowerCase();
        const hab = String(r.habitacionNumero ?? r.habitacionId ?? '').toLowerCase();
        const id = String(r.id);

        if (!nom.includes(termino) && !hab.includes(termino) && !id.includes(termino)) {
          return false;
        }
      }

      return true;
    });

    this.ordenar();
  }

  ordenar(): void {
    this.reservasFiltradas.sort((a, b) => {
      const fa = new Date(a.fechaIngreso).getTime();
      const fb = new Date(b.fechaIngreso).getTime();

      switch (this.orden) {
        case 'ingresoAsc':
          return fa - fb;
        case 'estado':
          return (a.estado ?? '').localeCompare(b.estado ?? '');
        default:
          return fb - fa;
      }
    });
  }

  contarHuespedes(r: ReservaResponse): number {
    return (r.huespedes ?? []).length;
  }

  estadoLabel(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'CONFIRMADA': return 'Confirmada';
      case 'EN_CURSO': return 'En curso';
      case 'FINALIZADA': return 'Finalizada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  }

  rolLabel(role: string | undefined): string {
    const limpio = this.normalizarRol(role);

    switch (limpio) {
      case 'CLIENTE': return 'Cliente';
      case 'RECEPCIONISTA': return 'Recepcionista';
      case 'ADMINISTRADOR': return 'Administrador';
      default: return role ?? '';
    }
  }

  private normalizarRol(role?: string | null): string {
    if (!role) return '';
    return role.trim().toUpperCase().replace(/^ROLE_/, '');
  }

  // =======================
  //  CANCELACIÓN CLIENTE
  // =======================

  puedeCancelar(r: ReservaResponse): boolean {
    if (this.modoAdmin) return false;
    return r.estado === 'PENDIENTE';
  }

  onCancelarClick(r: ReservaResponse): void {
    if (!this.puedeCancelar(r)) return;

    Swal.fire({
      title: `Cancelar reserva #${r.id}`,
      text: '¿Seguro que querés cancelar esta reserva? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#d33'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.reservasSrv.cancelarReserva(r.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Reserva cancelada',
            text: 'La reserva fue cancelada correctamente.'
          });

          if (!this.modoAdmin) {
            this.cargarMisReservas();
          }
        },
        error: (err) => {
          console.error('Error cancelando reserva', err);

          const msg = this.getBackendErrorMessage(
            err,
            'No se pudo cancelar la reserva.'
          );

          Swal.fire({
            icon: 'error',
            title: 'No se pudo cancelar',
            text: msg
          });
        }
      });
    });
  }

  // =======================
  //  HABITACIONES / IMG
  // =======================

  private cargarHabitaciones(): void {
    this.habSrv.getHabitaciones().subscribe({
      next: (habs) => {
        this.habitacionesMap.clear();
        for (const h of habs) {
          if (h.id != null) {
            this.habitacionesMap.set(h.id, h);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando habitaciones para thumbnails', err);
      }
    });
  }

  getHabitacionThumb(habitacionId?: number): string | null {
    if (!habitacionId) return null;

    const hab = this.habitacionesMap.get(habitacionId);
    if (!hab || !hab.imagenes || hab.imagenes.length === 0) return null;

    const primera: any = hab.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return null;

    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = this.defaultRoomImg;
  }
}
