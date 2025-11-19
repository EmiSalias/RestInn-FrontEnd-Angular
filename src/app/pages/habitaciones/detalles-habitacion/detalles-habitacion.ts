import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Habitacion from '../../../models/Habitacion';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';
import { AuthService } from '../../../services/auth-service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-habitacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles-habitacion.html',
  styleUrl: './detalles-habitacion.css'
})
export class DetallesHabitacion implements OnInit, OnDestroy {

  selectedHab?: Habitacion;
  imagenActualIndex = 0;
  intervaloCarrusel: any;

  // Flags de permisos
  isCliente = false;
  isAdmin = false;
  isRecepcionista = false;
  isConserje = false;
  isLimpieza = false;
  puedeGestionarHabitaciones = false; // Admin + Empleados

  private authSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public habService: HabitacionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.auth.state$.subscribe(state => {
      const roles = state.roles ?? [];
      const logged = state.isLoggedIn;
      
      this.isCliente = logged && roles.includes('CLIENTE');
      this.isAdmin = logged && roles.includes('ADMINISTRADOR');
      this.isRecepcionista = logged && roles.includes('RECEPCIONISTA');
      this.isConserje = logged && roles.includes('CONSERJE');
      this.isLimpieza = logged && roles.includes('LIMPIEZA');
      
      this.puedeGestionarHabitaciones = roles.some(r =>
        ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA'].includes(r)
      );
      
      this.cargarHabitacion();
    });
  }

  private cargarHabitacion() {
    const habId = Number(this.route.snapshot.paramMap.get('id'));

    if (habId) {
      // Solo el ADMIN usa el endpoint privado.
      // El resto (Recep, Conserje, etc.) usa el público.
      const endpoint$ = this.isAdmin
        ? this.habService.getHabitacionAdmin(habId)
        : this.habService.getHabitacion(habId);

      endpoint$.subscribe({
        next: (data) => {
          this.selectedHab = data;
          if (this.selectedHab.imagenes && this.selectedHab.imagenes.length > 1) {
            this.iniciarCarrusel();
          }
        },
        error: (err) => {
          console.error('Error al cargar habitación:', err);
          
          const msg = (err.status === 403) 
            ? 'No tienes permiso para ver esta habitación (posiblemente esté inactiva).'
            : 'No se pudo cargar la habitación.';

          Swal.fire('Error', msg, 'error');
          this.router.navigate(['/listado_habitaciones']);
        }
      });
    } else {
      Swal.fire('Error', 'ID de habitación inválido.', 'error');
      this.router.navigate(['/listado_habitaciones']);
    }
  }

  // --- CARRUSEL DE IMÁGENES ---
  iniciarCarrusel() {
    this.intervaloCarrusel = setInterval(() => this.siguienteImagen(), 8000);
  }

  siguienteImagen() {
    if (!this.selectedHab?.imagenes) return;
    this.imagenActualIndex =
      (this.imagenActualIndex + 1) % this.selectedHab.imagenes.length;
  }

  anteriorImagen() {
    if (!this.selectedHab?.imagenes) return;
    this.imagenActualIndex =
      (this.imagenActualIndex - 1 + this.selectedHab.imagenes.length) %
      this.selectedHab.imagenes.length;
  }

  irAImagen(i: number) {
    this.imagenActualIndex = i;
    clearInterval(this.intervaloCarrusel);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervaloCarrusel);
    this.authSub?.unsubscribe();
  }

  // --- FUNCIONES DE HABITACIÓN ---
  reservarHabitacion(hab: Habitacion) {
    this.router.navigate(['/crear_reserva/form'], {
      queryParams: { habitacionId: hab.id }
    });
  }

  editHabitacion(hab: Habitacion) {
    this.router.navigate(['/editar_habitacion', hab.id]);
  }

  // --- LÓGICA DE BORRADO LÓGICO Y REACTIVACIÓN ---
  inhabilitarHabitacion(hab: Habitacion) {
    Swal.fire({
      title: `¿Inhabilitar Habitación ${hab.numero}?`,
      text: 'La habitación se marcará como inactiva y no aparecerá en búsquedas públicas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, inhabilitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habService.inhabilitarHabitacion(hab.id).subscribe({
          next: () => {
            Swal.fire('Inhabilitada', 'La habitación ha sido marcada como inactiva.', 'success');
            if (this.selectedHab) {
              this.selectedHab.activo = false;
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'No se pudo inhabilitar.', 'error');
          }
        });
      }
    });
  }

  reactivarHabitacion(hab: Habitacion) {
    Swal.fire({
      title: `¿Reactivar Habitación ${hab.numero}?`,
      text: 'La habitación volverá a estar disponible para búsquedas y reservas.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habService.reactivarHabitacion(hab.id).subscribe({
          next: () => {
            Swal.fire('Reactivada', 'La habitación está activa nuevamente.', 'success');
            if (this.selectedHab) {
              this.selectedHab.activo = true;
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'No se pudo reactivar.', 'error');
          }
        });
      }
    });
  }

  detailHabitacion(hab: Habitacion) {
      this.router.navigate(['/habitacion', hab.id]);
    }

  volver() {
    this.router.navigate(['/listado_habitaciones']);
  }
}