import { Component, OnInit } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  CurrencyPipe,
  AsyncPipe
} from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, of, BehaviorSubject } from 'rxjs';
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';
import {
  FacturasService,
  FacturaResponseDTO
} from '../../../services/facturas-service';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';

type SortField =
  | 'id'
  | 'fechaEmision'
  | 'clienteNombre'
  | 'reservaId'
  | 'habitacionNumero'
  | 'tipoFactura'
  | 'estado'
  | 'totalFinal';

interface SortState {
  field: SortField;
  dir: 'asc' | 'desc';
}

@Component({
  selector: 'app-listado-facturas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    AsyncPipe
  ],
  templateUrl: './listado-facturas.html',
  styleUrls: ['./listado-facturas.css']
})
export class ListadoFacturas implements OnInit {

  facturas$ = of<FacturaResponseDTO[]>([]);
  error: string | null = null;
  cargando = true;
  isAdminOrRecep = false;

  filtrosForm: FormGroup;

  // ---- estado de orden ----
  sortState: SortState = { field: 'fechaEmision', dir: 'asc' };
  private sortSubject = new BehaviorSubject<SortState>(this.sortState);
  sort$ = this.sortSubject.asObservable();
  // -------------------------

  constructor(
    private facturasService: FacturasService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filtrosForm = this.fb.group({
      texto: [''],
      tipo: [''],
      estado: [''],
      desde: [''],
      hasta: ['']
    });
  }

  ngOnInit(): void {
    this.isAdminOrRecep = this.authService.hasAnyRole(['ADMINISTRADOR', 'RECEPCIONISTA']);

    const base$ =
      this.isAdminOrRecep
        ? this.facturasService.listarTodas()
        : this.facturasService.listarMias();   // <- el endpoint /mias que ya hicimos

    const baseCompartida$ = base$.pipe(
      catchError(err => {
        console.error(err);
        this.error = err?.error?.mensaje || 'No se pudieron cargar las facturas.';
        return of<FacturaResponseDTO[]>([]);
      }),
      shareReplay(1)
    );

    const filtros$ = this.filtrosForm.valueChanges.pipe(
      startWith(this.filtrosForm.value)
    );

    this.facturas$ = combineLatest([baseCompartida$, filtros$, this.sort$]).pipe(
      map(([facturas, filtros, sort]) => this.aplicarFiltrosYOrden(facturas, filtros, sort)),
      map(list => {
        this.cargando = false;
        return list;
      })
    );
  }

  private aplicarFiltrosYOrden(
  facturas: FacturaResponseDTO[],
  filtros: any,
  sort: SortState
): FacturaResponseDTO[] {

  const texto  = (filtros.texto  || '').toLowerCase().trim();
  const tipo   = filtros.tipo   || '';
  const estado = filtros.estado || '';

  let desde: Date | null = filtros.desde ? new Date(filtros.desde) : null;
  let hasta: Date | null = filtros.hasta ? new Date(filtros.hasta) : null;

  // 🛠 por las dudas: si hasta < desde, los invertimos
  if (desde && hasta && hasta < desde) {
    const tmp = desde;
    desde = hasta;
    hasta = tmp;
  }

  let res = facturas.filter(f => {
    if (texto) {
      const hay = (
        f.clienteNombre + ' ' +
        f.habitacionNumero + ' ' +
        f.reservaId + ' ' +
        f.id
      ).toLowerCase();
      if (!hay.includes(texto)) return false;
    }

    if (tipo && f.tipoFactura !== tipo) return false;
    if (estado && f.estado !== estado) return false;

    if (desde || hasta) {
      const fe = new Date(f.fechaEmision);

      if (desde && fe < desde) return false;

      if (hasta) {
        const h = new Date(hasta);
        h.setHours(23, 59, 59, 999);
        if (fe > h) return false;
      }
    }

    return true;
  });

  res = this.ordenarFacturas(res, sort);
  return res;
}

  private ordenarFacturas(arr: FacturaResponseDTO[], sort: SortState): FacturaResponseDTO[] {
    const dir = sort.dir === 'asc' ? 1 : -1;

    return [...arr].sort((a, b) => {
      let av: any;
      let bv: any;

      switch (sort.field) {
        case 'id':
          av = a.id; bv = b.id; break;
        case 'fechaEmision':
          av = new Date(a.fechaEmision).getTime();
          bv = new Date(b.fechaEmision).getTime();
          break;
        case 'clienteNombre':
          av = a.clienteNombre?.toLowerCase();
          bv = b.clienteNombre?.toLowerCase();
          break;
        case 'reservaId':
          av = a.reservaId; bv = b.reservaId; break;
        case 'habitacionNumero':
          av = Number(a.habitacionNumero);
          bv = Number(b.habitacionNumero);
          break;
        case 'tipoFactura':
          av = a.tipoFactura; bv = b.tipoFactura; break;
        case 'estado':
          av = a.estado; bv = b.estado; break;
        case 'totalFinal':
          av = a.totalFinal; bv = b.totalFinal; break;
      }

      if (av == null && bv == null) return 0;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  // click en header
  onSort(field: SortField): void {
    if (this.sortState.field === field) {
      this.sortState = {
        field,
        dir: this.sortState.dir === 'asc' ? 'desc' : 'asc'
      };
    } else {
      this.sortState = { field, dir: 'asc' };
    }
    this.sortSubject.next(this.sortState);
  }

  abrirPdf(f: FacturaResponseDTO): void {
    this.facturasService.descargarPdf(f.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: err => {
        console.error(err);
        this.error = 'No se pudo descargar el PDF de la factura.';
      }
    });
  }

  irADetalleReserva(f: FacturaResponseDTO): void {
    if (!f.reservaId) {
      return;
    }

    this.router.navigate(['/reserva', f.reservaId]);
  }
}
