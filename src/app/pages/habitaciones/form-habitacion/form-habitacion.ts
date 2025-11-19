import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';
import { ImagenService } from '../../../services/imagen-service';
import { ReservasService } from '../../../services/reservas-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth-service';
import { Subscription, Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

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
  imageError: string | null = null;
  isDragging = false; // para poder cargar imagenes arrastrandolas
  
  // Manejo de roles
  puedeGestionarHabitaciones = false;
  userRole: string = '';
  private authSub: Subscription | null = null;
  private habitacionOriginal: Habitacion | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private habService = inject(HabitacionService);
  private imgService = inject(ImagenService);
  private auth = inject(AuthService);

  get estadosPermitidos(): string[] {
    const todos = ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO', 'LIMPIEZA'];
    const estadoActual = this.habitacionOriginal?.estado;

    if (!this.editMode || !estadoActual) {
      return todos.filter(e => e !== 'OCUPADA');
    }

    // --- REGLAS POR ROL ---

    // ADMINISTRADOR: Mantiene la lógica que tenías (la original tuya)
    if (this.userRole === 'ADMINISTRADOR' || this.userRole === 'RECEPCIONISTA') {
        if (estadoActual === 'DISPONIBLE') return ['DISPONIBLE', 'MANTENIMIENTO', 'LIMPIEZA'];
        if (estadoActual === 'MANTENIMIENTO') return ['MANTENIMIENTO', 'DISPONIBLE', 'LIMPIEZA'];
        if (estadoActual === 'OCUPADA') return ['OCUPADA'];
        if (estadoActual === 'LIMPIEZA') return ['LIMPIEZA', 'MANTENIMIENTO', 'DISPONIBLE'];
    }

    // CONSERJE: Restricciones específicas
    if (this.userRole === 'CONSERJE') {
        if (estadoActual === 'OCUPADA') return ['OCUPADA'];
        if (estadoActual === 'DISPONIBLE') return ['DISPONIBLE', 'MANTENIMIENTO'];
        if (estadoActual === 'MANTENIMIENTO') return ['MANTENIMIENTO', 'DISPONIBLE'];
    }

    // LIMPIEZA: Restricciones específicas
    if (this.userRole === 'LIMPIEZA') {
        if (estadoActual === 'OCUPADA') return ['OCUPADA'];
        if (estadoActual === 'DISPONIBLE') return ['DISPONIBLE', 'LIMPIEZA'];
        if (estadoActual === 'LIMPIEZA') return ['LIMPIEZA', 'DISPONIBLE'];
    }

    return [estadoActual];
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      numero: [null, [Validators.required,Validators.min(1),Validators.max(9999)],[this.numeroUnicoValidator()]],
      piso: [null, [Validators.required, Validators.min(1), Validators.max(4)]],
      capacidad: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      cantCamas: [null, [Validators.required, Validators.min(1), Validators.max(4)]],
      precioNoche: [null, [Validators.required, Validators.min(0.01), Validators.max(999999999.99)]],
      estado: ['DISPONIBLE', Validators.required],
      tipo: ['SIMPLE', Validators.required],
      comentario: ['', Validators.maxLength(255)],
      activo: [true]
    });

    this.authSub = this.auth.state$.subscribe(state => {
      const roles = state.roles || [];
      
      // Detectamos el rol principal
      if (roles.includes('ADMINISTRADOR')) this.userRole = 'ADMINISTRADOR';
      else if (roles.includes('RECEPCIONISTA')) this.userRole = 'RECEPCIONISTA';
      else if (roles.includes('CONSERJE')) this.userRole = 'CONSERJE';
      else if (roles.includes('LIMPIEZA')) this.userRole = 'LIMPIEZA';
      else this.userRole = 'CLIENTE';

      // Validamos permiso general de acceso al componente
      this.puedeGestionarHabitaciones = ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA'].includes(this.userRole);

      // Si es CLIENTE, afuera
      if (!this.puedeGestionarHabitaciones) {
        this.router.navigate(['/unauthorized']);
        return;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editMode = true;
      this.habitacionId = Number(idParam);
      this.cargarHabitacion(this.habitacionId);
    } else {
      // Si NO hay ID (estamos creando), validamos que sea ADMIN
      if (this.userRole !== 'ADMINISTRADOR') {
        Swal.fire('Acceso denegado', 'Solo los administradores pueden crear habitaciones.', 'error');
        this.router.navigate(['/listado_habitaciones']);
      }
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  cargarHabitacion(id: number) {
    this.loading = true;
    
    // Solo el ADMIN usa el endpoint que ve inactivas
    const endpoint$ = (this.userRole === 'ADMINISTRADOR')
      ? this.habService.getHabitacionAdmin(id) // Carga activas e inactivas
      : this.habService.getHabitacion(id);     // Carga solo activas (dará error si está inactiva)

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
        this.loading = false;
        // Mensaje específico si no es admin y la habitación está inactiva (404 o similar)
        Swal.fire('Error', 'No se pudo cargar la habitación (o no tienes permisos para verla si está inactiva).', 'error');
        this.router.navigate(['/listado_habitaciones']);
      }
    });
  }

  // METODO PARA LA CARGA DE IMAGENES
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      this.processFiles(files);
    }

    input.value = '';
  }

  // METODO PARA ELIMINAR IMAGENES EN EL FORM
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

    if (this.imagenesPreview.length <= 5) {
      this.imageError = null;
    }
  }

  // DRAG & DROP
  // 1. Detectar cuando entra un archivo arrastrado
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  // 2. Detectar cuando sale
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  // 3. Detectar cuando se suelta (DROP)
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      // Filtramos solo imágenes por seguridad
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length < files.length) {
        Swal.fire('Aviso', 'Algunos archivos no eran imágenes y fueron ignorados.', 'info');
      }
      
      this.processFiles(imageFiles);
    }
  }

  processFiles(newFiles: File[]) {
    // 1. Reiniciamos error
    this.imageError = null;

    // 2. Validamos cantidad máxima (5)
    const totalEstimado = this.imagenesPreview.length + newFiles.length;
    
    if (totalEstimado > 5) {
      this.imageError = `Máximo 5 imágenes. Intentaste agregar ${newFiles.length} y ya tenías ${this.imagenesPreview.length}.`;
      return;
    }

    // 3. Procesamos cada archivo para mostrar la preview
    for (const file of newFiles) {

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesPreview.push({
          id: null,          // Es nueva
          url: e.target.result, // Base64 para mostrar en <img>
          file: file         // Archivo real para enviar al backend
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // METODO PARA VALIDAR QUE EL NUMERO INGRESADO NO EXISTA
  numeroUnicoValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null); // Si está vacío, dejamos que Validators.required se encargue
      }

      return timer(500).pipe(
        switchMap(() => {
          return this.habService.listarTodasIncluidasInactivas();
        }),
        map(habitaciones => {
          const numeroIngresado = Number(control.value);
          
          // Buscamos si alguna habitación ya tiene ese número
          const existe = habitaciones.find(h => h.numero === numeroIngresado);

          if (existe) {
            // Si estamos editando y el número encontrado es el de ESTA habitación, es válido.
            if (this.editMode && this.habitacionId && existe.id === this.habitacionId) {
              return null;
            }
            // Si encontramos otra habitación con el mismo número, devolvemos error
            return { numeroDuplicado: true };
          }
          
          return null; // No existe, es válido
        }),
        catchError(() => of(null)) // Si falla la API, no bloqueamos la validación
      );
    };
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