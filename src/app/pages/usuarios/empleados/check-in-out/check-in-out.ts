import { Component, OnInit, inject }        from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { Router, RouterLink }               from '@angular/router';
import { ReservaResponse, ReservasService } from '../../../../services/reservas-service';
import { FacturasService }                  from '../../../../services/facturas-service';
import { AuthService }                      from '../../../../services/auth-service';
import   Swal                               from 'sweetalert2';
import   FacturaReservaInfoDTO              from '../../../../models/FacturaReservaInfoDTO';

@Component({
  selector: 'app-check-in-out',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './check-in-out.html',
  styleUrls: ['./check-in-out.css']
})
export class CheckInOut implements OnInit {

  private reservasSrv = inject(ReservasService);
  private facturasSrv = inject(FacturasService);
  private auth        = inject(AuthService);
  private router      = inject(Router);

  cargando                              = true;
  errorMsg: string | null               = null;
  sinPermisos                           = false;
  pendientesCheckIn: ReservaResponse[]  = [];
  pendientesCheckOut: ReservaResponse[] = [];

  ngOnInit(): void {
    if (!this.auth.hasAnyRole([
      'ADMINISTRADOR',
      'RECEPCIONISTA'
    ])) {
      this.sinPermisos = true;
      this.cargando = false;
      return;
    }

    this.cargarTareas();
  }

  // #region CARGA Y ORDEN
  private cargarTareas(): void {
    this.cargando = true;
    this.errorMsg = null;

    this.reservasSrv.getReservasAdmin().subscribe({
      next: (reservas) => {
        const checkIn: ReservaResponse[] = [];
        const checkOut: ReservaResponse[] = [];

        reservas.forEach(r => {
          if (r.estado === 'CONFIRMADA') {
            checkIn.push(r);
          } else if (r.estado === 'EN_CURSO') {
            checkOut.push(r);
          }
        });

        this.pendientesCheckIn  = this.ordenarCheckIn(checkIn);
        this.pendientesCheckOut = this.ordenarCheckOut(checkOut);

        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err?.error?.mensaje || 'No se pudieron cargar las reservas.';
        this.cargando = false;
      }
    });
  }

  // Normaliza fecha (solo día)
  private normalizarFecha(value: string | Date): number {
    const d = new Date(value);
    const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return base.getTime();
  }

  private hoyDia(): number {
    const hoy = new Date();
    return this.normalizarFecha(hoy);
  }

  // PRIORIDAD CHECK-IN
  private prioridadCheckIn(r: ReservaResponse): number {
    const hoy = this.hoyDia();
    const ingreso = this.normalizarFecha(r.fechaIngreso);

    if (hoy > ingreso) return 0;
    if (hoy === ingreso) return 1;
    return 2;
  }

  private ordenarCheckIn(arr: ReservaResponse[]): ReservaResponse[] {
    return [...arr].sort((a, b) => {
      const pa = this.prioridadCheckIn(a);
      const pb = this.prioridadCheckIn(b);
      if (pa !== pb) return pa - pb;

      const fa = this.normalizarFecha(a.fechaIngreso);
      const fb = this.normalizarFecha(b.fechaIngreso);
      return fa - fb;
    });
  }

  // PRIORIDAD CHECK-OUT
  private prioridadCheckOut(r: ReservaResponse): number {
    const hoy = this.hoyDia();
    const salida = this.normalizarFecha(r.fechaSalida);

    if (hoy > salida) return 0;
    if (hoy === salida) return 1;
    return 2;
  }

  private ordenarCheckOut(arr: ReservaResponse[]): ReservaResponse[] {
    return [...arr].sort((a, b) => {
      const pa = this.prioridadCheckOut(a);
      const pb = this.prioridadCheckOut(b);
      if (pa !== pb) return pa - pb;

      const fa = this.normalizarFecha(a.fechaSalida);
      const fb = this.normalizarFecha(b.fechaSalida);
      return fa - fb;
    });
  }
  // #endregion

  // #region HELPERS DE ESTADO / CSS
  get totalTareas(): number {
    return this.pendientesCheckIn.length + this.pendientesCheckOut.length;
  }

  estadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'PENDIENTE':   return 'Pendiente';
      case 'CONFIRMADA':  return 'Confirmada';
      case 'EN_CURSO':    return 'En curso';
      case 'FINALIZADA':  return 'Finalizada';
      case 'CANCELADA':   return 'Cancelada';
      default:            return estado ?? '';
    }
  }

  // check-in
  esCheckInAtrasado(r: ReservaResponse): boolean {
    return this.prioridadCheckIn(r) === 0;
  }

  esCheckInHoy(r: ReservaResponse): boolean {
    return this.prioridadCheckIn(r) === 1;
  }

  rowClassCheckIn(r: ReservaResponse): any {
    return {
      'row-critical': this.esCheckInAtrasado(r),
      'row-warning': this.esCheckInHoy(r)
    };
  }

  // check-out
  esCheckOutAtrasado(r: ReservaResponse): boolean {
    return this.prioridadCheckOut(r) === 0;
  }

  esCheckOutHoy(r: ReservaResponse): boolean {
    return this.prioridadCheckOut(r) === 1;
  }

  rowClassCheckOut(r: ReservaResponse): any {
    return {
      'row-critical': this.esCheckOutAtrasado(r),
      'row-warning': this.esCheckOutHoy(r)
    };
  }
  // #endregion

  // #region NAVEGACIÓN
  irADetalleReserva(r: ReservaResponse): void {
    this.router.navigate(['/reserva', r.id], {
      queryParams: { returnTo: '/check_in_out' }
    });
  }
  // #endregion

  // #region CHECK-IN
  hacerCheckIn(r: ReservaResponse): void {
    Swal.fire({
      title: `Check-in reserva #${r.id}`,
      text: `¿Confirmar check-in de la habitación ${r.habitacionNumero || r.habitacionId}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, hacer check-in',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2196F3'
    }).then(result => {
      if (!result.isConfirmed) { return; }

      this.reservasSrv.checkIn(r.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Check-in realizado',
            text: 'La reserva pasó a estado EN_CURSO.'
          }).then(() => this.cargarTareas());
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'No se pudo hacer check-in',
            text: err?.error?.mensaje || 'Ocurrió un error al hacer check-in.'
          });
        }
      });
    });
  }
  // #endregion

  // #region CHECK-OUT con advertencias
  hacerCheckOut(r: ReservaResponse): void {
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
            { queryParams: { returnTo: '/check_in_out' } }
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
          text: 'La reserva se actualizó correctamente.'
        }).then(() => this.cargarTareas());
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo hacer check-out',
          text: err?.error?.mensaje || 'Ocurrió un error al hacer check-out.'
        });
      }
    });
  }
  // #endregion
}
