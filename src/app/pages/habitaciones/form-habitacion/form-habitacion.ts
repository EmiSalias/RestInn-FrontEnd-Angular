import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';
import { ImagenService } from '../../../services/imagen-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth-service';
import { Subscription, Observable } from 'rxjs';

// Interface para manejar las imágenes de forma más limpia
interface ImagenPreview {
  id: number | null;
  url: string;
  file: File | null;
}

@Component({
  selector: 'app-form-habitacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-habitacion.html',
  styleUrls: ['./form-habitacion.css']
})
export class FormHabitacion implements OnInit, OnDestroy {

  form!: FormGroup;
  editMode = false;
  loading = false;
  habitacionId?: number;
  
  imagenesPreview: ImagenPreview[] = [];
  
  // Manejo de roles
  puedeGestionarHabitaciones = false;
  private authSub: Subscription | null = null;
  private habitacionOriginal: Habitacion | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private habService = inject(HabitacionService);
  private imgService = inject(ImagenService);
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.form = this.fb.group({
      numero: [null, Validators.required],
      piso: [0, Validators.min(0)],
      capacidad: [1, Validators.min(1)],
      cantCamas: [1, Validators.min(1)],
      precioNoche: [0, [Validators.required, Validators.min(0.01)]],
      estado: ['DISPONIBLE', Validators.required],
      tipo: ['SIMPLE', Validators.required],
      comentario: [''],
      activo: [true]
    });

    this.authSub = this.auth.state$.subscribe(state => {
      this.puedeGestionarHabitaciones = state.roles.some(r =>
        ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA'].includes(r)
      );
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editMode = true;
      this.habitacionId = Number(idParam);
      this.cargarHabitacion(this.habitacionId);
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  cargarHabitacion(id: number) {
    this.loading = true;
    
    const endpoint$ = this.puedeGestionarHabitaciones
      ? this.habService.getHabitacionAdmin(id) // Carga activas e inactivas
      : this.habService.getHabitacion(id);     // Carga solo activas

    endpoint$.subscribe({
      next: (data) => {
        this.habitacionOriginal = data; // Guardamos el estado original
        this.form.patchValue(data);
        this.loading = false;

        // Convertimos las imágenes del backend a nuestro formato de preview
        if (data.imagenes?.length) {
          this.imagenesPreview = data.imagenes.map(img => ({
            id: img.id,
            url: `data:${img.tipo};base64,${img.datosBase64}`,
            file: null
          }));
        }
      },
      error: () => {
        Swal.fire('Error', 'Error al cargar la habitación', 'error');
        this.router.navigate(['/listado_habitaciones']);
      }
    });
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesPreview.push({
          id: null,
          url: e.target.result,
          file: file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    const imagenARemover = this.imagenesPreview[index];
    
    if (imagenARemover.id !== null) {
      
      if (!this.habitacionId) return;
    
      const imagenIdParaBorrar = imagenARemover.id; 

      Swal.fire({
        title: '¿Eliminar imagen?',
        text: 'Esta acción es permanente y eliminará la imagen del servidor.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.imgService.deleteImagen(this.habitacionId!, imagenIdParaBorrar).subscribe({
            next: () => {
              this.imagenesPreview.splice(index, 1);
              Swal.fire('Eliminada', 'La imagen ha sido eliminada.', 'success');
            },
            error: (err) => {
              Swal.fire('Error', err.message || 'No se pudo eliminar la imagen.', 'error');
            }
          });
        }
      });
    } else {
      this.imagenesPreview.splice(index, 1);
    }
  }


  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const habitacion: Habitacion = {
      id: this.editMode ? this.habitacionId! : 0,
      ...this.form.value,
      imagenes: []
    };

    if (this.editMode && this.habitacionId) {
      this.handleUpdate(habitacion);
    } else {
      this.handleCreate(habitacion);
    }
  }

  handleCreate(habitacion: Habitacion) {
    this.habService.postHabitacion(habitacion).subscribe({
      next: (res) => {
        const newId = res.id;
        this.subirImagenes(newId);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err.message || 'Error al guardar la habitación.', 'error');
      }
    });
  }

  handleUpdate(habitacion: Habitacion) {
    const estaReactivando = this.habitacionOriginal?.activo === false && habitacion.activo === true;

    let updateObs$: Observable<any>;

    if (estaReactivando) {
      updateObs$ = this.habService.reactivarHabitacion(habitacion.id);
    } else {
      updateObs$ = this.habService.updateHabitacion(habitacion);
    }

    updateObs$.subscribe({
      next: () => {
        this.subirImagenes(habitacion.id);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err.message || 'Error al actualizar la habitación.', 'error');
      }
    });
  }

  subirImagenes(habitacionId: number) {
    const imagenesNuevas = this.imagenesPreview.filter(img => img.file);

    if (imagenesNuevas.length === 0) {
      this.finalizarGuardado();
      return;
    }

    let subidas = 0;
    for (const img of imagenesNuevas) {
      this.imgService.postImagen(habitacionId, img.file!).subscribe({
        next: () => {
          subidas++;
          if (subidas === imagenesNuevas.length) {
            this.finalizarGuardado();
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al subir imagen:', err);
          Swal.fire('Error', 'Se guardaron los datos, pero falló la subida de una o más imágenes.', 'warning');
          this.router.navigate(['/listado_habitaciones']);
        }
      });
    }
  }

  finalizarGuardado() {
    this.loading = false;
    Swal.fire({
      title: this.editMode ? 'Habitación actualizada' : 'Habitación creada',
      text: 'Los datos se guardaron correctamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
    this.router.navigate(['/listado_habitaciones']);
  }

  volver() {
    this.router.navigate(['/listado_habitaciones']);
  }
}