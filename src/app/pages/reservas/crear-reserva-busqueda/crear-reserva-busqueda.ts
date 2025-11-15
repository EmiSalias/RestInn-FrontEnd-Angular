import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import Habitacion from '../../../models/Habitacion';
import { HabitacionService } from '../../../services/habitacion-service';
import { ReservasService } from '../../../services/reservas-service';

@Component({
  selector: 'app-crear-reserva-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reserva-busqueda.html',
  styleUrl: './crear-reserva-busqueda.css'
})
export class CrearReservaBusqueda {

  private habSrv = inject(HabitacionService);
  private reservasSrv = inject(ReservasService);
  private router = inject(Router);

  todayStr = new Date().toISOString().slice(0, 10);

  fechaIngreso = '';
  fechaSalida = '';

  loading = false;
  errorMsg: string | null = null;
  rangoInvalido = false;

  habitacionesDisponibles: Habitacion[] = [];

  // placeholder para cuando falle la imagen
  defaultRoomImg = 'assets/images/habitaciones/placeholder-room.jpg';

  openPicker(input: HTMLInputElement | null, ev?: MouseEvent): void {
    if (!input) return;

    // Evito que algún click raro burbujee
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }

    // Siempre enfoco para que se pueda escribir al menos (Firefox)
    input.focus();

    const anyInput = input as any;
    // Navegadores que soportan showPicker (Chrome/Edge modernos)
    if (typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    } else {
      // Fallback: disparo un click programático por si el navegador
      // abre algo con eso; en Firefox será sólo para escribir.
      input.click();
    }
  }

  onFechasChange(): void {
    this.errorMsg = null;
    this.rangoInvalido = false;
    this.habitacionesDisponibles = [];

    if (!this.fechaIngreso || !this.fechaSalida) {
      return;
    }

    if (this.fechaSalida <= this.fechaIngreso) {
      this.rangoInvalido = true;
      return;
    }

    this.cargarDisponibilidad();
  }

  private cargarDisponibilidad(): void {
    this.loading = true;

    const fi = this.fechaIngreso;
    const fs = this.fechaSalida;

    forkJoin({
      habs: this.habSrv.getHabitaciones(),
      ocupadas: this.reservasSrv.getHabitacionesOcupadas(fi, fs)
    }).subscribe({
      next: ({ habs, ocupadas }) => {
        const setOcupadas = new Set(ocupadas ?? []);
        this.habitacionesDisponibles = (habs ?? [])
          .filter(h => h.id != null && !setOcupadas.has(h.id));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error buscando disponibilidad', err);
        this.errorMsg = err?.error?.message || 'No se pudo obtener la disponibilidad.';
        this.loading = false;
      }
    });
  }

  getMainImageDataUrl(hab: Habitacion): string | null {
    if (!hab.imagenes || hab.imagenes.length === 0) return null;
    const primera: any = hab.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return null;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = this.defaultRoomImg;
  }

  reservar(hab: Habitacion): void {
    if (!this.fechaIngreso || !this.fechaSalida) return;

    this.router.navigate(['/crear_reserva/form'], {
      queryParams: {
        habitacionId: hab.id,
        capacidad: hab.capacidad,
        fechaIngreso: this.fechaIngreso,
        fechaSalida: this.fechaSalida
      }
    });
  }
}
