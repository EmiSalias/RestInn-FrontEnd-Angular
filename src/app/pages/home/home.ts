import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import Habitacion from '../../models/Habitacion';
import { HabitacionesService } from '../../services/habitaciones.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private habitacionesService = inject(HabitacionesService);

  habitaciones: Habitacion[] = [];
  loading = true;
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.habitacionesService.getHabitacionesActivas().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error pidiendo habitaciones', err);
        this.errorMsg = 'No se pudieron cargar las habitaciones 😢';
        this.loading = false;
      }
    });
  }

  /**
   * Devuelve algo tipo:
   *   data:image/png;base64,iVBORw0KGgoAAA...
   * que es válido como [src] de <img>
   */
  getMainImageDataUrl(hab: Habitacion): string | null {
    if (!hab.imagenes || hab.imagenes.length === 0) {
      return null;
    }

    const primera = hab.imagenes[0];

    // seguridad básica por si algo viene null
    if (!primera.datosBase64 || !primera.tipo) {
      return null;
    }

    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }
}
