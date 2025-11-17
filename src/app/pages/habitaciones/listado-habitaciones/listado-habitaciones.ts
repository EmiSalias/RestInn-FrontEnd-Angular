import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HabitacionService } from '../../../services/habitacion-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-habitaciones',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './listado-habitaciones.html',
  styleUrl: './listado-habitaciones.css'
})
export class ListadoHabitaciones implements OnInit, OnDestroy {
  private habService = inject(HabitacionService);
  private router = inject(Router);
  private auth = inject(AuthService);

  private subs = new Subscription();

  habitaciones: Habitacion[] = []; // Contiene TODAS las habitaciones (activas o no)
  habitacionesFiltradas: Habitacion[] = [];

  filtrosVisibles = false;
  rangeError = false;
  loading = false;
  errorMsg = '';
  isCliente = false;
  puedeGestionarHabitaciones = false;

  filtros = {
    estado: '',
    capacidadMin: null as number | null,
    capacidadMax: null as number | null,
    precioMin: null as number | null,
    precioMax: null as number | null,
    fechaDesde: '',
    fechaHasta: '',
    filtroActivo: 'activas' 
  };

  orden = 'Numero asc'; // Orden por defecto

  ngOnInit(): void {
    const s = this.auth.state$.subscribe(state => {
      const roles = state.roles ?? [];
      const logged = state.isLoggedIn;

      this.isCliente = logged && roles.includes('CLIENTE');
      this.puedeGestionarHabitaciones = logged && roles.some(r =>
        ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA'].includes(r)
      );

      // Si es admin, que por defecto vea todas
      if (this.puedeGestionarHabitaciones) {
        this.filtros.filtroActivo = 'todas';
      }

      if (this.habitaciones.length === 0 && !this.loading) {
        this.getHabitaciones();
      }
    });

    this.subs.add(s);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  abrirFiltros() {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  cancelarFiltros() {
    this.filtrosVisibles = false;
  }

  limpiarFiltros() {
    this.filtros = {
      estado: '',
      capacidadMin: null,
      capacidadMax: null,
      precioMin: null,
      precioMax: null,
      fechaDesde: '',
      fechaHasta: '',
      filtroActivo: this.puedeGestionarHabitaciones ? 'todas' : 'activas'
    };
    this.errorMsg = '';
    this.rangeError = false;
    this.habitacionesFiltradas = [...this.habitaciones];
    this.orden = 'Numero asc';
    this.ordenarHabitaciones();
  }

  agregarNueva() {
    this.router.navigate(['/crear_habitacion/form']);
  }

  getHabitaciones() {
    this.loading = true;
    this.errorMsg = '';

    const endpoint$ = this.puedeGestionarHabitaciones
      ? this.habService.listarTodasIncluidasInactivas() // Admin ve activas e inactivas
      : this.habService.getHabitaciones();              // Cliente solo ve activas

    endpoint$.subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar habitaciones:', err);
        this.errorMsg = 'Error al cargar las habitaciones.';
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    this.loading = true;
    this.errorMsg = '';
    this.rangeError = false;

    if (this.filtros.fechaDesde && this.filtros.fechaHasta) {
      if (new Date(this.filtros.fechaHasta) < new Date(this.filtros.fechaDesde)) {
        this.rangeError = true;
        this.loading = false;
        return;
      }

      this.habService.getHabitacionesDisponibles(this.filtros.fechaDesde, this.filtros.fechaHasta).subscribe({
        next: (data) => {
          this.habitacionesFiltradas = data;
          this.ordenarHabitaciones();
          this.loading = false;
          Swal.fire('Filtro por Fechas', 'Mostrando habitaciones disponibles. Se ignoraron los otros filtros.', 'info');
        },
        error: (err) => {
          this.errorMsg = err.message || 'Error al filtrar por fechas. ¿Iniciaste sesión?';
          this.loading = false;
        }
      });
      return;
    }

    const f = this.filtros;
    this.habitacionesFiltradas = this.habitaciones.filter(h => {

      if (f.filtroActivo === 'activas' && !h.activo) return false;
      if (f.filtroActivo === 'inactivas' && h.activo) return false;
      
      if (f.estado && h.estado !== f.estado) return false;
      if (f.capacidadMin !== null && h.capacidad < f.capacidadMin) return false;
      if (f.capacidadMax !== null && h.capacidad > f.capacidadMax) return false;
      if (f.precioMin !== null && h.precioNoche < f.precioMin) return false;
      if (f.precioMax !== null && h.precioNoche > f.precioMax) return false;
      
      return true;
    });

    this.ordenarHabitaciones();
    this.loading = false;
    this.filtrosVisibles = false;
  }


  ordenarHabitaciones() {
    if (!this.orden) return;
    this.habitacionesFiltradas.sort((a, b) => {
      switch (this.orden) {
        case 'Numero asc': return a.numero - b.numero;
        case 'Numero desc': return b.numero - a.numero;
        case 'Precio asc': return a.precioNoche - b.precioNoche;
        case 'Precio desc': return b.precioNoche - a.precioNoche;
        case 'Capacidad asc': return a.capacidad - b.capacidad;
        case 'Capacidad desc': return b.capacidad - a.capacidad;
        default: return 0;
      }
    });
  }

  getMainImageDataUrl(hab: Habitacion): string | null {
    if (!hab.imagenes || hab.imagenes.length === 0) return null;
    const primera = hab.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return null;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  reservarHabitacion(hab: Habitacion) {
  }

  editHabitacion(hab: Habitacion) {
    this.router.navigate(['/editar_habitacion', hab.id]);
  }

  inhabilitarHabitacion(hab: Habitacion) {
    Swal.fire({
      title: `¿Inhabilitar Habitación ${hab.numero}?`,
      text: 'La habitación se marcará como inactiva y no aparecerá en búsquedas públicas. ¿Continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, inhabilitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habService.inhabilitarHabitacion(hab.id).subscribe({
          next: () => {
            Swal.fire(
              'Inhabilitada',
              'La habitación ha sido marcada como inactiva.',
              'success'
            );
            this.getHabitaciones();
          },
          error: (err) => {
            Swal.fire(
              'Error',
              err.message || 'No se pudo inhabilitar. Verifique si tiene reservas activas.',
              'error'
            );
          }
        });
      }
    });
  }

  reactivarHabitacion(hab: Habitacion) {
    Swal.fire({
      title: `¿Reactivar Habitación ${hab.numero}?`,
      text: 'La habitación volverá a estar disponible para búsquedas y reservas.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habService.reactivarHabitacion(hab.id).subscribe({
          next: () => {
            Swal.fire(
              'Reactivada',
              'La habitación está activa nuevamente.',
              'success'
            );
            this.getHabitaciones();
          },
          error: (err) => {
            Swal.fire(
              'Error',
              err.message || 'No se pudo reactivar la habitación.',
              'error'
            );
          }
        });
      }
    });
  }

  detailHabitacion(hab: Habitacion) {
    this.router.navigate(['/habitacion', hab.id]);
  }
}