import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Habitacion from '../../models/Habitacion';
import { HabitacionService } from '../../services/habitacion-service';
import { ReservasService } from '../../services/reservas-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private HabitacionService = inject(HabitacionService);
  private reservasService = inject(ReservasService);
  private router = inject(Router);
  private auth = inject(AuthService);

  habitaciones: Habitacion[] = [];
  visibles: Habitacion[] = [];

  loading = true;
  errorMsg: string | null = null;

  // filtro fechas
  todayStr = new Date().toISOString().split('T')[0];
  filtro: { ingreso?: string; salida?: string } = {};
  buscando = false;
  rangeError = false;

  ngOnInit(): void {
    this.HabitacionService.getHabitaciones().subscribe({

      next: (data) => {
        this.habitaciones = data;
        this.visibles = data;       // por defecto, todas
        this.loading = false;
      },
      error: (err) => {
        console.error('Error pidiendo habitaciones', err);
        this.errorMsg = 'No se pudieron cargar las habitaciones 😢';
        this.loading = false;
      }
    });
  }

  getMainImageDataUrl(hab: Habitacion): string | null {
    if (!hab.imagenes?.length) return null;
    const primera = hab.imagenes[0];
    if (!primera?.datosBase64 || !primera?.tipo) return null;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  // === Buscar disponibilidad ===
  buscarDisponibles(): void {
    if (!this.filtro.ingreso || !this.filtro.salida || this.rangeError) return;

    this.buscando = true;
    this.reservasService.getHabitacionesOcupadas(this.filtro.ingreso, this.filtro.salida)
      .subscribe({
        next: (ocupadas) => {
          const occ = new Set(ocupadas || []);
          this.visibles = this.habitaciones.filter(h => !occ.has(h.id));
          this.buscando = false;
        },
        error: (err) => {
          console.error('Error consultando ocupación', err);
          this.errorMsg = 'No pudimos verificar disponibilidad.';
          this.buscando = false;
        }
      });
  }

  limpiarFiltro(): void {
    this.filtro = {};
    this.rangeError = false;
    this.visibles = this.habitaciones.slice();
  }

  reservar(hab: Habitacion) {
    const habitacionId = hab.id;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: {
          returnUrl: '/crear_reserva/form',
          habitacionId: hab.id,
          capacidad: hab.capacidad,           // 👈 NUEVO
          ingreso: this.filtro.ingreso || null,
          salida: this.filtro.salida || null
        }
      });
      return;
    }

    // roles permitidos
    const allowed = ['CLIENTE', 'ADMINISTRADOR', 'RECEPCIONISTA'];
    if (!this.auth.hasAnyRole(allowed)) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    // OK → al form con id + (opcional) fechas para prefilling
    this.router.navigate(['/crear_reserva/form'], {
      queryParams: {
        habitacionId: hab.id,
        capacidad: hab.capacidad,           // 👈 NUEVO
        ingreso: this.filtro.ingreso || null,
        salida: this.filtro.salida || null
      }
    });
  }
  onFechaChange(): void {
    // si no hay ambas fechas, reseteo vista y errores
    if (!this.filtro.ingreso || !this.filtro.salida) {
      this.rangeError = false;
      this.visibles = this.habitaciones.slice();
      return;
    }
    this.rangeError = new Date(this.filtro.salida) <= new Date(this.filtro.ingreso);
    if (this.rangeError) return;

    // todo OK → consultar ocupadas y filtrar
    this.buscarDisponibles();
  }



}
