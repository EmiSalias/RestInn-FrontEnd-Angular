// src/app/pages/reservas/detalle-reserva/detalle-reserva.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservasService, ReservaResponse } from '../../../services/reservas-service';
import { HabitacionService } from '../../../services/habitacion-service';
import Habitacion from '../../../models/Habitacion';
import { AuthService } from '../../../services/auth-service';    // ⬅️ NUEVO
import Swal from 'sweetalert2';                                  // ⬅️ NUEVO

@Component({
  selector: 'app-detalle-reserva',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalles-reserva.html',
  styleUrl: './detalles-reserva.css'
})
export class DetalleReserva implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservasSrv = inject(ReservasService);
  private habSrv = inject(HabitacionService);
  private auth = inject(AuthService);                           // ⬅️ NUEVO

  reserva?: ReservaResponse;
  habitacion?: Habitacion;

  loading = false;
  errorMsg: string | null = null;

  defaultRoomImg = 'assets/images/habitaciones/placeholder-room.jpg';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id) {
      this.errorMsg = 'Reserva no encontrada.';
      return;
    }

    this.cargarDetalle(id);
  }

  private cargarDetalle(id: number): void {
    this.loading = true;
    this.errorMsg = null;

    this.reservasSrv.getReservaDetalle(id).subscribe({
      next: (res) => {
        this.reserva = res;
        this.loading = false;

        if (res.habitacionId) {
          this.habSrv.getHabitacion(res.habitacionId).subscribe({
            next: (hab) => this.habitacion = hab,
            error: (err) => console.error('Error cargando habitación', err)
          });
        }
      },
      error: (err) => {
        console.error('Error cargando reserva', err);
        this.errorMsg = err?.error?.message || 'No se pudo cargar la reserva.';
        this.loading = false;
      }
    });
  }

  get huespedes() {
    return this.reserva?.huespedes ?? [];
  }

  get noches(): number {
    if (!this.reserva) return 0;
    const ini = new Date(this.reserva.fechaIngreso).getTime();
    const fin = new Date(this.reserva.fechaSalida).getTime();
    const diff = fin - ini;
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  estadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'CONFIRMADA': return 'Confirmada';
      case 'EN_CURSO': return 'En curso';
      case 'FINALIZADA': return 'Finalizada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado ?? '';
    }
  }

  /** A dónde volver según rol, si no hay history */
  private rutaListadoFallback(): string {
    if (this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA'])) {
      return '/listado_reservas';
    }
    return '/mis_reservas';
  }

  volver(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate([this.rutaListadoFallback()]);
    }
  }

  getHabitacionImage(): string {
    if (!this.habitacion || !this.habitacion.imagenes?.length) {
      return this.defaultRoomImg;
    }
    const primera: any = this.habitacion.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return this.defaultRoomImg;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  // ======================
  //  CANCELAR RESERVA
  // ======================

  /** Solo cliente + estado PENDIENTE */
  get puedeCancelarReserva(): boolean {
    if (!this.reserva) return false;
    if (!this.auth.hasAnyRole(['CLIENTE'])) return false;
    return this.reserva.estado === 'PENDIENTE';
  }

  cancelarReserva(): void {
    if (!this.reserva) return;

    const r = this.reserva;

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
          }).then(() => {
            this.volver();
          });
        },
        error: (err) => {
          console.error('Error cancelando reserva', err);
          const msg = err?.error?.message || 'No se pudo cancelar la reserva.';
          Swal.fire({
            icon: 'error',
            title: 'No se pudo cancelar',
            text: msg
          });
        }
      });
    });
  }
}
