import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HabitacionService } from '../../../services/habitacion-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listado-habitaciones',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './listado-habitaciones.html',
  styleUrl: './listado-habitaciones.css'
})
export class ListadoHabitaciones implements OnInit {
  private habService = inject(HabitacionService);
  private router = inject(Router);

  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];

  filtrosVisibles = false;
  rangeError = false;
  loading = false;
  errorMsg = '';

  filtros = {
    estado: '',
    capacidadMin: null as number | null,
    capacidadMax: null as number | null,
    precioMin: null as number | null,
    precioMax: null as number | null,
    fechaDesde: '',
    fechaHasta: ''
  };

  orden = '';

  ngOnInit(): void {
    this.getHabitaciones();
  }

  abrirFiltros() {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  cancelarFiltros() {
    this.filtrosVisibles = false;
  }

  aplicarFiltros() {
    this.filtrarHabitaciones();
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
      fechaHasta: ''
    };
    this.habitacionesFiltradas = [...this.habitaciones];
    this.orden = '';
  }

  agregarNueva() {
    this.router.navigate(['/crear_habitacion/form']);
  }

  getHabitaciones() {
    this.loading = true;
    this.habService.getHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.habitacionesFiltradas = [...data];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar habitaciones:', err);
        this.errorMsg = 'Error al cargar las habitaciones.';
        this.loading = false;
      }
    });
  }

  filtrarHabitaciones() {
    // Validación de rango de fechas
    if (this.filtros.fechaDesde && this.filtros.fechaHasta) {
      const desde = new Date(this.filtros.fechaDesde);
      const hasta = new Date(this.filtros.fechaHasta);
      this.rangeError = hasta < desde;
      if (this.rangeError) return;
    }

    this.habitacionesFiltradas = this.habitaciones.filter(h => {
      return (
        (!this.filtros.estado || h.estado === this.filtros.estado) &&
        (!this.filtros.capacidadMin || h.capacidad >= +this.filtros.capacidadMin) &&
        (!this.filtros.capacidadMax || h.capacidad <= +this.filtros.capacidadMax) &&
        (!this.filtros.precioMin || h.precioNoche >= +this.filtros.precioMin) &&
        (!this.filtros.precioMax || h.precioNoche <= +this.filtros.precioMax)
      );
    });

    this.ordenarHabitaciones();
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
      this.router.navigate(['/crear_reserva/form'], {
        queryParams: { habitacionId: hab.id }
      });
    }

  editHabitacion(hab: Habitacion) {
    this.router.navigate(['/editar_habitacion', hab.id]);
  }

  deleteHabitacion(id: number) {
    if (confirm('¿Seguro que quieres eliminar esta habitación?')) {
      this.habService.deleteHabitacion(id).subscribe({
        next: () => {
          alert('Habitación eliminada con éxito.');
          this.getHabitaciones();
        },
        error: (err) => {
          console.error('Error al eliminar la habitación:', err);
          alert('Ha ocurrido un error al intentar eliminar la habitación.');
        }
      });
    }
  }

  detailHabitacion(hab: Habitacion) {
    this.router.navigate(['/habitacion', hab.id]);
  }
}
