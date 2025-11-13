import { Component, OnInit, OnDestroy } from '@angular/core';
import Habitacion from '../../../models/Habitacion';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';

@Component({
  selector: 'app-detalles-habitacion',
  templateUrl: './detalles-habitacion.html',
  styleUrl: './detalles-habitacion.css'
})
export class DetallesHabitacion implements OnInit, OnDestroy {

  selectedHab?: Habitacion;
  imagenActualIndex = 0;
  intervaloCarrusel: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public habService: HabitacionService
  ) {}

  ngOnInit(): void {
    const habId = Number(this.route.snapshot.paramMap.get('id'));

    if (habId) {
      this.habService.getHabitacion(habId).subscribe({
        next: (data) => {
          console.log('Habitación recibida:', data);
          this.selectedHab = data;

          // Si tiene más de una imagen, inicia el carrusel
          if (this.selectedHab.imagenes && this.selectedHab.imagenes.length > 1) {
            this.iniciarCarrusel();
          }
        },
        error: (err) => {
          console.error('Error al cargar habitación:', err);
          alert('Ha ocurrido un error al cargar el detalle de la habitación.');
          this.router.navigate(['/listado_habitaciones']);
        }
      });
    } else {
      alert('ID inexistente. Redirigiéndote al listado.');
      this.router.navigate(['/listado_habitaciones']);
    }
  }

  // --- CARRUSEL DE IMÁGENES ---
  iniciarCarrusel() {
    this.intervaloCarrusel = setInterval(() => this.siguienteImagen(), 4000);
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
  }

  // --- FUNCIONES DE HABITACIÓN ---
  getMainImageDataUrl(hab: Habitacion): string | null {
    if (!hab.imagenes || hab.imagenes.length === 0) return null;
    const primera = hab.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return null;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  reservarHabitacion(hab: Habitacion) {
    this.router.navigate(['/crear_reserva/form'], {
      queryParams: { habitacionId: hab.id }
    });
  }

  editHabitacion(hab: Habitacion) {
    this.router.navigate(['/editar_habitacion', hab.id]);
  }

  deleteHabitacion(id: number) {
    if (confirm('¿Seguro que quieres eliminar esta habitación?')) {
      this.habService.deleteHabitacion(id).subscribe({
        next: () => {
          alert('Habitación eliminada con éxito.');
          this.router.navigate(['/listado_habitaciones']);
        },
        error: (err) => {
          console.error('Error al eliminar la habitación:', err);
          alert('Ha ocurrido un error al intentar eliminar la habitación.');
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/listado_habitaciones']);
  }
}
