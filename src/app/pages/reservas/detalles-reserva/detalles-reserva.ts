import { Component, OnInit, inject }        from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { ActivatedRoute, Router }           from '@angular/router';
import { ReservasService, ReservaResponse } from '../../../services/reservas-service';
import { HabitacionService }                from '../../../services/habitacion-service';
import { AuthService }                      from '../../../services/auth-service';
import { FacturasService }                  from '../../../services/facturas-service';
import   Habitacion                         from '../../../models/Habitacion';
import   Swal                               from 'sweetalert2';
import   FacturaResponseDTO                 from '../../../models/FacturaResponseDTO';
import   FacturaReservaInfoDTO              from '../../../models/FacturaReservaInfoDTO';

@Component({
  selector: 'app-detalle-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles-reserva.html',
  styleUrls: ['./detalles-reserva.css']
})
export class DetallesReserva implements OnInit {

  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private reservasSrv = inject(ReservasService);
  private habSrv      = inject(HabitacionService);
  private auth        = inject(AuthService);
  private facturasSrv = inject(FacturasService);

  reserva?: ReservaResponse;
  habitacion?: Habitacion;
  facturaReserva?: FacturaResponseDTO | null;
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

        this.cargarFacturaReserva(res.id);
      },
      error: (err) => {
        console.error('Error cargando reserva', err);
        this.errorMsg = err?.error?.message || 'No se pudo cargar la reserva.';
        this.loading = false;
      }
    });
  }

  private cargarFacturaReserva(reservaId: number): void {
    this.facturasSrv.getFacturaPorReserva(reservaId).subscribe({
      next: (f) => this.facturaReserva = f,
      error: (err) => {
        console.warn('No se pudo cargar la factura de la reserva', err);
        this.facturaReserva = null;
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

  estadoFacturaLabel(): string {
    if (!this.facturaReserva) return 'Sin factura';
    switch (this.facturaReserva.estado) {
      case 'EMITIDA': return 'Emitida';
      case 'EN_PROCESO': return 'En proceso';
      case 'PAGADA': return 'Pagada';
      case 'ANULADA': return 'Anulada';
      default: return this.facturaReserva.estado;
    }
  }

  get tieneFacturaReserva(): boolean {
    return !!this.facturaReserva;
  }

  verFactura(): void {
    if (!this.facturaReserva) return;
    this.router.navigate(
      ['/detalle_factura', this.facturaReserva.id],
      { queryParams: { returnTo: `/detalle_reserva/${this.reserva?.id}` } }
    );
  }

  //  VOLVER
  private rutaListado(): string {
    if (this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA'])) {
      return '/listado_reservas';
    }
    return '/habitaciones';
  }

  volver(): void {
    this.router.navigate([this.rutaListado()]);
  }

  getHabitacionImage(): string {
    if (!this.habitacion || !this.habitacion.imagenes?.length) {
      return this.defaultRoomImg;
    }
    const primera: any = this.habitacion.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return this.defaultRoomImg;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  //  CONFIRMAR RESERVA
  get puedeConfirmarReserva(): boolean {
    if (!this.reserva) return false;
    if (!this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA'])) return false;
    return this.reserva.estado === 'PENDIENTE';
  }

  confirmarReserva(): void {
    if (!this.reserva) return;

    const r = this.reserva;

    Swal.fire({
      title: `Confirmar reserva #${r.id}`,
      text: '¿Seguro que querés confirmar esta reserva?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#4CAF50'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.reservasSrv.confirmarReserva(r.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Reserva confirmada',
            text: 'La reserva fue confirmada correctamente.'
          }).then(() => {
            this.router.navigate(['/listado_reservas']);
          });
        },
        error: (err) => {
          console.error('Error confirmando reserva', err);
          Swal.fire({
            icon: 'error',
            title: 'No se pudo confirmar',
            text: err?.error?.message || 'No se pudo confirmar la reserva.'
          });
        }
      });
    });
  }

  //  CHECK-IN
  get puedeCheckIn(): boolean {
    if (!this.reserva) return false;
    if (!this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA'])) return false;
    return this.reserva.estado === 'CONFIRMADA';
  }

  checkIn(): void {
    if (!this.reserva) return;

    const r = this.reserva;

    Swal.fire({
      title: `Check-in reserva #${r.id}`,
      text: '¿Seguro que quieres hacer el check-in de esta reserva?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, hacer check-in',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#2196F3'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.reservasSrv.checkIn(r.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Check-in realizado',
            text: 'El check-in fue realizado correctamente.'
          }).then(() => {
            this.volver();
          });
        },
        error: (err) => {
          console.error('Error haciendo check-in', err);
          Swal.fire({
            icon: 'error',
            title: 'No se pudo hacer check-in',
            text: err?.error?.mensaje || 'No se pudo hacer check-in.'
          });
        }
      });
    });
  }

  //  CHECK-OUT (con advertencias)
  get puedeCheckOut(): boolean {
    if (!this.reserva) return false;
    if (!this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA'])) return false;
    return this.reserva.estado === 'EN_CURSO';
  }

  checkOut(): void {
    if (!this.reserva) return;
    const r = this.reserva;

    const hoy = new Date();
    const salida = new Date(r.fechaSalida);
    const hoyDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
    const salidaDia = new Date(salida.getFullYear(), salida.getMonth(), salida.getDate()).getTime();
    const checkoutAnticipado = hoyDia < salidaDia;
    this.facturasSrv.getInfoFacturaReserva(r.id).subscribe({
      next: (info: FacturaReservaInfoDTO) => {
        this.mostrarConfirmacionCheckout(r, checkoutAnticipado, info);
      },
      error: (err) => {
        console.warn('No se pudo obtener info de factura de reserva', err);
        this.mostrarConfirmacionCheckout(r, checkoutAnticipado, null);
      }
    });
  }

  private mostrarConfirmacionCheckout(
    r: ReservaResponse,
    checkoutAnticipado: boolean,
    info: FacturaReservaInfoDTO | null
  ): void {

    const tieneFacturaImpaga =
      !!info &&
      (info.estadoFactura === 'EMITIDA' || info.estadoFactura === 'EN_PROCESO');

    const baseText =
      `¿Confirmar check-out de la habitación ${r.habitacionNumero || r.habitacionId}?`;

    const warnings: string[] = [];

    if (tieneFacturaImpaga && info) {
      warnings.push(
        `La factura de <b>RESERVA</b> asociada a esta reserva está en estado <b>${info.estadoFactura}</b> (no pagada).<br>` +
        `Si continuás, se registrará el check-out igualmente, dejando un saldo pendiente.`
      );
    }

    if (checkoutAnticipado) {
      const salidaFmt = new Date(r.fechaSalida).toLocaleDateString('es-AR');
      warnings.push(
        `Estás realizando el check-out antes de la fecha de salida registrada: <b>${salidaFmt}</b>.`
      );
    }

    const html = [
      `<p>${baseText}</p>`,
      warnings.length
        ? `<div style="margin-top:8px;color:#f57c00;font-weight:500;">${warnings.join('<br><br>')}</div>`
        : ''
    ].join('');

    if (tieneFacturaImpaga && info) {
      Swal.fire({
        title: `Check-out reserva #${r.id}`,
        html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ver factura',
        cancelButtonText: 'Continuar con el check-out',
        confirmButtonColor: '#1976D2',
        cancelButtonColor: '#D32F2F',
        reverseButtons: true
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(
            ['/detalle_factura', info.facturaId],
            { queryParams: { returnTo: `/detalle_reserva/${r.id}` } }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.ejecutarCheckOut(r);
        }
      });
    } else {
      Swal.fire({
        title: `Check-out reserva #${r.id}`,
        html,
        icon: checkoutAnticipado ? 'warning' : 'info',
        showCancelButton: true,
        confirmButtonText: 'Sí, hacer check-out',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#FF9800'
      }).then(result => {
        if (result.isConfirmed) {
          this.ejecutarCheckOut(r);
        }
      });
    }
  }

  private ejecutarCheckOut(r: ReservaResponse): void {
    this.reservasSrv.checkOut(r.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Check-out realizado',
          text: 'El check-out fue realizado correctamente.'
        }).then(() => {
          this.volver();
        });
      },
      error: (err) => {
        console.error('Error haciendo check-out', err);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo hacer check-out',
          text: err?.error?.mensaje || 'No se pudo hacer check-out.'
        });
      }
    });
  }
}
