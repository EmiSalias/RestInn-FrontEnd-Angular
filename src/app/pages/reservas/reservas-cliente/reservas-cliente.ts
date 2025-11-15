import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservasService, ReservaResponse } from '../../../services/reservas-service';

@Component({
  selector: 'app-reservas-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservas-cliente.html',
  styleUrl: './reservas-cliente.css'
})
export class ReservasCliente implements OnInit {
  private reservasSrv = inject(ReservasService);

  reservas: ReservaResponse[] = [];
  loading = false;
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.cargarMisReservas();
  }

  cargarMisReservas(): void {
    this.loading = true;
    this.errorMsg = null;

    this.reservasSrv.getMisReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error obteniendo mis reservas', err);
        this.errorMsg = err?.error?.message || 'No se pudieron cargar tus reservas.';
        this.loading = false;
      }
    });
  }

  contarHuespedes(r: ReservaResponse): number {
    return (r.huespedes ?? []).length;
  }

  estadoLabel(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':   return 'Pendiente';
      case 'CONFIRMADA':  return 'Confirmada';
      case 'EN_CURSO':    return 'En curso';
      case 'FINALIZADA':  return 'Finalizada';
      case 'CANCELADA':   return 'Cancelada';
      default:            return estado;
    }
  }
}
