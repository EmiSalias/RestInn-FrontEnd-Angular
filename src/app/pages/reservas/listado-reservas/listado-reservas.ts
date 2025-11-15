// src/app/pages/reservas/listado-reservas/listado-reservas.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservasService, ReservaResponse } from '../../../services/reservas-service';
import Habitacion from '../../../models/Habitacion';
import { HabitacionService } from '../../../services/habitacion-service';


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

  habitacionesMap = new Map<number, Habitacion>();
  reservas: ReservaResponse[] = [];
  reservasFiltradas: ReservaResponse[] = [];

  defaultRoomImg = 'assets/images/habitaciones/placeholder-room.jpg';

  loading = false;
  errorMsg: string | null = null;

  // Combo de clientes únicos (para filtrar)
  clientesUnicos: { id: number; nombre: string }[] = [];

  filtros = {
    estado: '',
    rolUsuario: '',
    clienteId: null as number | null,
    fechaDesde: '',
    fechaHasta: '',
    search: ''
  };

  orden = 'ingresoDesc';  // ingreso más reciente primero

  ngOnInit(): void {
    this.cargarTodas();
    this.cargarHabitaciones();
  }

  cargarTodas(): void {
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

    const dDesde = fechaDesde ? new Date(fechaDesde) : null;
    const dHasta = fechaHasta ? new Date(fechaHasta) : null;
    const termino = search.trim().toLowerCase();

    // normalizamos el valor elegido en el combo ('' | CLIENTE | RECEPCIONISTA | ADMINISTRADOR)
    const claveRolFiltro = this.normalizarRol(rolUsuario);

    this.reservasFiltradas = this.reservas.filter(r => {
      const fIng = new Date(r.fechaIngreso);
      const fSal = new Date(r.fechaSalida);

      // --- Rango de fechas ---
      if (dDesde && fIng < dDesde) return false;
      if (dHasta && fSal > dHasta) return false;

      // --- Estado ---
      if (estado && r.estado !== estado) return false;

      // --- Rol que creó la reserva (CLIENTE / RECEPCIONISTA / ADMINISTRADOR) ---
      if (claveRolFiltro) {
        const rolReserva = this.normalizarRol(r.usuario?.role);
        if (rolReserva !== claveRolFiltro) return false;
      }

      // --- Cliente específico ---
      if (clienteId && r.usuario?.id !== clienteId) return false;

      // --- Búsqueda texto ---
      if (termino) {
        const nom = `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''}`.toLowerCase();
        const hab = String(r.habitacionNumero ?? r.habitacionId ?? '').toLowerCase();
        const id = String(r.id);

        if (!nom.includes(termino) &&
          !hab.includes(termino) &&
          !id.includes(termino)) {
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
        default: // ingresoDesc
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

  /** Normaliza cualquier forma del rol a algo tipo:
   *  'ROLE_cliente  ' -> 'CLIENTE'
   */
  private normalizarRol(role?: string | null): string {
    if (!role) return '';
    return role.trim().toUpperCase().replace(/^ROLE_/, '');
  }

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

    // mismo formato que usás en getMainImageDataUrl
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = this.defaultRoomImg;
  }

}
