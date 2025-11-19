import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FacturasService } from '../../../services/facturas-service';
import FacturaReservaInfoDTO from '../../../models/FacturaReservaInfoDTO';

@Component({
  selector: 'app-reservas-finalizadas-impagas',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './reservas-finalizadas-impagas.html',
  styleUrls: ['./reservas-finalizadas-impagas.css']
})
export class ReservasFinalizadasImpagas implements OnInit {

  reservas: FacturaReservaInfoDTO[] = [];
  cargando = true;
  error: string | null = null;

  constructor(
    private facturasService: FacturasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.facturasService.listarReservasFinalizadasImpagas().subscribe({
      next: data => {
        this.reservas = data;
        this.cargando = false;
      },
      error: err => {
        console.error(err);
        this.error = err?.error?.mensaje || 'No se pudo cargar el listado.';
        this.cargando = false;
      }
    });
  }

  verFactura(f: FacturaReservaInfoDTO): void {
    if (!f.facturaId) { return; }
    this.router.navigate(['/detalle_factura', f.facturaId], {
      queryParams: { returnTo: '/reservas_finalizadas_impagas' }
    });
  }

  verReserva(f: FacturaReservaInfoDTO): void {
    if (!f.reservaId) { return; }
    this.router.navigate(['/reserva', f.reservaId]);
  }

  volverAFacturas(): void {
    this.router.navigate(['/listado_facturas']);
  }
}
