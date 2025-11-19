import { Component, OnInit, inject }            from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { ActivatedRoute, Router, RouterLink }   from '@angular/router';
import { FacturasService }                      from '../../../services/facturas-service';
import { AuthService }                          from '../../../services/auth-service';
import { Location }                             from '@angular/common';
import   Swal                                   from 'sweetalert2';
import   FacturaResponseDTO                     from '../../../models/FacturaResponseDTO';

@Component({
  selector: 'app-detalle-factura',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-factura.html',
  styleUrls: ['./detalle-factura.css']
})
export class DetalleFactura implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facturasSrv = inject(FacturasService);
  private auth = inject(AuthService);
  private location = inject(Location);
  readonly IVA_PORCENTAJE = 10;

  factura?: FacturaResponseDTO;
  loading = false;
  errorMsg: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id) {
      this.errorMsg = 'Factura no encontrada.';
      return;
    }

    this.cargarFactura(id);
  }

  private cargarFactura(id: number): void {
    this.loading = true;
    this.errorMsg = null;

    this.facturasSrv.getFacturaPorId(id).subscribe({
      next: (f) => {
        this.factura = f;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando factura', err);
        this.errorMsg = err?.error?.message || 'No se pudo cargar la factura.';
        this.loading = false;
      }
    });
  }

  get puedeMarcarPagada(): boolean {
    if (!this.factura) return false;
    if (!this.auth.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA'])) return false;
    return this.factura.estado !== 'PAGADA' && this.factura.estado !== 'ANULADA';
  }

  estadoLabel(estado: string | undefined): string {
    switch (estado) {
      case 'EMITIDA': return 'Emitida';
      case 'EN_PROCESO': return 'En proceso';
      case 'PAGADA': return 'Pagada';
      case 'ANULADA': return 'Anulada';
      default: return estado ?? '';
    }
  }

  marcarPagada(): void {
    if (!this.factura) return;
    const f = this.factura;

    Swal.fire({
      title: `Marcar factura #${f.id} como pagada`,
      text: 'Se registrará el pago en efectivo de esta reserva. ¿Confirmás?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar como pagada',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4CAF50'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.facturasSrv.pagarFacturaPorId(f.id).subscribe({
        next: (actualizada) => {
          this.factura = actualizada;
          Swal.fire({
            icon: 'success',
            title: 'Factura pagada',
            text: 'La factura fue marcada como pagada correctamente.'
          }).then(() => {
            const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
            if (returnTo) {
              this.router.navigateByUrl(returnTo);
            }
          });
        },
        error: (err) => {
          console.error('Error marcando factura pagada', err);
          Swal.fire({
            icon: 'error',
            title: 'No se pudo registrar el pago',
            text: err?.error?.message || 'Ocurrió un error al actualizar la factura.'
          });
        }
      });
    });
  }


  descargarPdf(): void {
    if (!this.factura) return;

    this.facturasSrv.descargarPdf(this.factura.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error('Error descargando PDF', err);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo descargar el PDF',
          text: err?.error?.message || 'Ocurrió un error al descargar el archivo.'
        });
      }
    });
  }

  volver() {
    this.location.back();
  }

  get ivaMonto(): number {
    if (!this.factura) return 0;
    return +(this.factura.subtotal * 0.10).toFixed(2);
  }


  get descuentoMonto(): number {
    if (!this.factura || !this.factura.descuento) return 0;
    const baseConIva = (this.factura.subtotal ?? 0) * (1 + this.IVA_PORCENTAJE / 100);
    return baseConIva * (this.factura.descuento / 100);
  }

  get interesMonto(): number {
    if (!this.factura || !this.factura.interes) return 0;
    const baseConIva = (this.factura.subtotal ?? 0) * (1 + this.IVA_PORCENTAJE / 100);
    return baseConIva * (this.factura.interes / 100);

  }
}
