import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';
import { ImagenService } from '../../../services/imagen-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth-service';
import { Subscription, Observable, of, timer, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import ImagenPreview from '../../../models/ImagenPreview';
import { EmpleadoService } from '../../../services/empleado-service';

@Component({
  selector: 'app-form-habitacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-habitacion.html',
  styleUrls: ['./form-habitacion.css']
})
export class FormHabitacion implements OnInit, OnDestroy {
  form!: FormGroup;
  editMode = false;
  loading = false;
  habitacionId?: number;
  isAdmin = false;

  imagenesPreview: ImagenPreview[] = [];
  imageError: string | null = null;
  isDragging = false;

  puedeGestionarHabitaciones = false;
  userRole: string = '';
  private authSub: Subscription | null = null;
  private habitacionOriginal: Habitacion | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private habService = inject(HabitacionService);
  private empleadoService = inject(EmpleadoService);
  private imgService = inject(ImagenService);
  private auth = inject(AuthService);

  get estadosPermitidos(): string[] {
    const todos = ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO', 'LIMPIEZA'];
    const estadoActual = this.habitacionOriginal?.estado;

    if (!this.editMode || !estadoActual) {
      return todos.filter(e => e !== 'OCUPADA');
    }

    if (this.userRole === 'ADMINISTRADOR' || this.userRole === 'RECEPCIONISTA') {
      if (['DISPONIBLE', 'MANTENIMIENTO', 'LIMPIEZA'].includes(estadoActual)) {
        return ['DISPONIBLE', 'MANTENIMIENTO', 'LIMPIEZA'];
      }
      if (estadoActual === 'OCUPADA') return ['OCUPADA'];
    }

    if (this.userRole === 'CONSERJE') {
      if (estadoActual === 'OCUPADA') return ['OCUPADA'];
      if (estadoActual === 'DISPONIBLE') return ['DISPONIBLE', 'MANTENIMIENTO'];
      if (estadoActual === 'MANTENIMIENTO') return ['MANTENIMIENTO', 'DISPONIBLE'];
    }

    if (this.userRole === 'LIMPIEZA') {
      if (estadoActual === 'OCUPADA') return ['OCUPADA'];
      if (estadoActual === 'DISPONIBLE') return ['DISPONIBLE', 'LIMPIEZA'];
      if (estadoActual === 'LIMPIEZA') return ['LIMPIEZA', 'DISPONIBLE'];
    }

    return [estadoActual];
  }

  ngOnInit(): void {
    this.authSub = this.auth.state$.subscribe(state => {
      const roles = state.roles ?? [];
      const logged = state.isLoggedIn;
      this.isAdmin = logged && roles.includes('ADMINISTRADOR');

      if (roles.includes('ADMINISTRADOR')) this.userRole = 'ADMINISTRADOR';
      else if (roles.includes('RECEPCIONISTA')) this.userRole = 'RECEPCIONISTA';
      else if (roles.includes('CONSERJE')) this.userRole = 'CONSERJE';
      else if (roles.includes('LIMPIEZA')) this.userRole = 'LIMPIEZA';
      else this.userRole = 'CLIENTE';

      this.puedeGestionarHabitaciones = ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA'].includes(this.userRole);

      if (!this.puedeGestionarHabitaciones) {
        this.router.navigate(['/unauthorized']);
        return;
      }
    });

    this.form = this.fb.group({
      id: [null],
      numero: [null, [Validators.required, Validators.min(1), Validators.max(9999)], [this.numeroUnicoValidator()]],
      piso: [null, [Validators.required, Validators.min(1), Validators.max(4)]],
      capacidad: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      cantCamas: [null, [Validators.required, Validators.min(1), Validators.max(4)]],
      precioNoche: [null, [Validators.required, Validators.min(0.01), Validators.max(999999999.99)]],
      estado: ['DISPONIBLE', Validators.required],
      tipo: ['SIMPLE', Validators.required],
      comentario: ['', Validators.maxLength(255)],
      activo: [true]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editMode = true;
      this.habitacionId = Number(idParam);
      this.cargarHabitacion(this.habitacionId);
    } else {
      if (this.userRole !== 'ADMINISTRADOR') {
        Swal.fire('Acceso denegado', 'Solo los administradores pueden crear habitaciones.', 'error');
        this.router.navigate(['/listado_habitaciones']);
      }
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  onEstadoChange(event: Event) {
    const nuevoEstado = (event.target as HTMLSelectElement).value;

    const id = this.form.get('id')?.value;
    const estadoActual = this.habitacionOriginal?.estado || this.form.get('estado')?.value;

    if (!id || nuevoEstado === estadoActual) return;

    if (this.userRole === 'ADMINISTRADOR') {
      const habitacionActualizada: Habitacion = { ...this.form.value, id };
      this.habService.updateHabitacion(habitacionActualizada).subscribe({
        next: (res) => {
          this.form.get('estado')?.setValue(res.estado);
          if (this.habitacionOriginal) this.habitacionOriginal.estado = res.estado;
          Swal.fire('Actualizado', `Estado cambiado a ${res.estado}`, 'success');
        },
        error: (err) => {
          Swal.fire('Error', err.message || 'No se pudo actualizar el estado.', 'error');
        }
      });
      return;
    }

    const acciones: Record<string, (id: number) => Observable<Habitacion>> = {
      'DISPONIBLE': this.empleadoService.ponerDisponible.bind(this.empleadoService),
      'MANTENIMIENTO': this.empleadoService.cambiarEstadoMantenimiento.bind(this.empleadoService),
      'LIMPIEZA': this.empleadoService.cambiarEstadoLimpieza.bind(this.empleadoService)
    };

    const accion = acciones[nuevoEstado];
    if (!accion) {
      Swal.fire('Error', 'Estado no reconocido.', 'error');
      return;
    }

    accion(id).subscribe({
      next: (res) => {
        this.form.get('estado')?.setValue(res.estado);
        if (this.habitacionOriginal) this.habitacionOriginal.estado = res.estado;
        Swal.fire('Actualizado', `La habitación está en ${res.estado}.`, 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.message || `No se pudo cambiar a ${nuevoEstado}.`, 'error');
      }
    });
  }



  cargarHabitacion(id: number) {
    this.loading = true;
    const endpoint$ = this.userRole === 'ADMINISTRADOR'
      ? this.habService.getHabitacionAdmin(id)
      : this.habService.getHabitacion(id);

    endpoint$.subscribe({
      next: (data) => {
        this.habitacionOriginal = data;

        this.form.patchValue({
          id: data.id,
          numero: data.numero,
          piso: data.piso,
          capacidad: data.capacidad,
          cantCamas: data.cantCamas,
          precioNoche: data.precioNoche,
          estado: (data.estado || 'DISPONIBLE').toUpperCase(),
          tipo: data.tipo,
          comentario: data.comentario,
          activo: data.activo
        });

        if (data.imagenes?.length) {
          this.imagenesPreview = data.imagenes.map(img => ({
            id: img.id,
            url: `data:${img.tipo};base64,${img.datosBase64}`,
            file: null
          }));
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar la habitación.', 'error');
        this.router.navigate(['/listado_habitaciones']);
      }
    });
  }

  numeroUnicoValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return timer(500).pipe(
        switchMap(() => this.habService.listarTodasIncluidasInactivas()),
        map(habitaciones => {
          const numeroIngresado = Number(control.value);
          const existe = habitaciones.find(h => h.numero === numeroIngresado);
          if (existe && (!this.editMode || existe.id !== this.habitacionId)) {
            return { numeroDuplicado: true };
          }
          return null;
        }),
        catchError(() => of(null))
      );
    };
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.processFiles(files);
    }
    input.value = '';
  }

  removeImage(index: number) {
    const imagenARemover = this.imagenesPreview[index];

    if (imagenARemover.id !== null && imagenARemover.id !== undefined) {
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

    if (this.imagenesPreview.length <= 5) {
      this.imageError = null;
    }
  }

  // Drag & Drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length < files.length) {
        Swal.fire('Aviso', 'Algunos archivos no eran imágenes y fueron ignorados.', 'info');
      }

      this.processFiles(imageFiles);
    }
  }

  processFiles(newFiles: File[]) {
    this.imageError = null;

    const totalEstimado = this.imagenesPreview.length + newFiles.length;
    if (totalEstimado > 5) {
      this.imageError = `Máximo 5 imágenes. Intentaste agregar ${newFiles.length} y ya tenías ${this.imagenesPreview.length}.`;
      return;
    }

    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        this.imageError = 'Solo se permiten archivos de imagen.';
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesPreview.push({
          id: null,
          url: e.target.result,
          file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id: number | null = this.form.get('id')?.value ?? null;
    const nuevoEstado: string = this.form.get('estado')?.value;

    this.loading = true;
    const habitacion: Habitacion = {
      id: this.editMode ? this.habitacionId! : 0,
      ...this.form.value,
      activo: this.form.get('activo')?.value ?? true,
      imagenes: []
    };
    
    // Caso edición (hay id)
    if (this.userRole === 'ADMINISTRADOR') {
      const habitacionActualizada: Habitacion = { ...this.form.value, id };
      this.habService.updateHabitacion(habitacionActualizada).subscribe({
        next: (res) => {
          this.form.patchValue({ estado: res.estado });
          if (this.habitacionOriginal) this.habitacionOriginal.estado = res.estado;
          Swal.fire('Actualizado', `Estado cambiado a ${res.estado}`, 'success');
        },
        error: (err) => Swal.fire('Error', err.message || 'No se pudo actualizar la habitación.', 'error')
      });
      return;
    }

    // Empleados (RECEPCIONISTA / LIMPIEZA / CONSERJE): solo cambio de estado
    const acciones: Record<string, (id: number) => Observable<Habitacion>> = {
      'DISPONIBLE': this.empleadoService.ponerDisponible.bind(this.empleadoService),
      'MANTENIMIENTO': this.empleadoService.cambiarEstadoMantenimiento.bind(this.empleadoService),
      'LIMPIEZA': this.empleadoService.cambiarEstadoLimpieza.bind(this.empleadoService)
    };

    const accion = acciones[nuevoEstado];
    if (!accion) {
      Swal.fire('Error', 'Estado no reconocido.', 'error');
      return;
    }

    if (!id) return;
    accion(id).subscribe({
      next: (res) => {
        this.form.patchValue({ estado: res.estado });
        if (this.habitacionOriginal) this.habitacionOriginal.estado = res.estado;
        Swal.fire('Actualizado', `La habitación está en ${res.estado}.`, 'success');
      },
      error: (err) => Swal.fire('Error', err.message || `No se pudo cambiar a ${nuevoEstado}.`, 'error')
    });
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
    const estaDesactivando = this.habitacionOriginal?.activo === true && habitacion.activo === false;

    if (estaReactivando) {
      this.habService.reactivarHabitacion(habitacion.id).subscribe({
        next: () => this.subirImagenes(habitacion.id),
        error: (err) => {
          this.loading = false;
          Swal.fire('Error', err.message || 'No se pudo reactivar la habitación.', 'error');
        }
      });
      return;
    }

    if (estaDesactivando) {
      this.habService.inhabilitarHabitacion(habitacion.id).subscribe({
        next: () => this.finalizarGuardado(),
        error: (err) => {
          this.loading = false;
          Swal.fire('Error', err.message || 'No se pudo inhabilitar la habitación.', 'error');
        }
      });
      return;
    }

    this.habService.updateHabitacion(habitacion).subscribe({
      next: (res) => {
        if (res && res.id === habitacion.id) {
          this.subirImagenes(habitacion.id);
        } else {
          this.loading = false;
          Swal.fire('Error', 'El servidor no aplicó los cambios.', 'error');
        }
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

    const uploadRequests = imagenesNuevas.map(img =>
      this.imgService.postImagen(habitacionId, img.file!)
    );

    forkJoin(uploadRequests).subscribe({
      next: () => this.finalizarGuardado(),
      error: (err) => {
        this.loading = false;
        console.error('Error al subir imagen:', err);
        Swal.fire('Error', 'Se guardaron los datos, pero falló la subida de una o más imágenes.', 'warning');
        this.router.navigate(['/listado_habitaciones']);
      }
    });
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
