import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';
import { ImagenService } from '../../../services/imagen-service'; // <-- nuevo servicio para subir imágenes
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-habitacion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-habitacion.html',
  styleUrls: ['./form-habitacion.css']
})
export class FormHabitacion implements OnInit {

  form!: FormGroup;
  editMode = false;
  loading = false;
  habitacionId?: number;
  imagenesPreview: string[] = [];
  imagenesArchivos: File[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private habService: HabitacionService,
    private imgService: ImagenService
  ) { }

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

    // Detectar si estamos editando
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editMode = true;
      this.habitacionId = Number(idParam);
      this.cargarHabitacion(this.habitacionId);
    }
  }

  cargarHabitacion(id: number) {
    this.loading = true;
    this.habService.getHabitacion(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.loading = false;

        // Si tiene imágenes, mostrarlas como preview
        if (data.imagenes?.length) {
          this.imagenesPreview = data.imagenes.map(img =>
            `data:${img.tipo};base64,${img.datosBase64}`
          );
        }
      },
      error: () => {
        alert('Error al cargar la habitación');
        this.router.navigate(['/listado_habitaciones']);
      }
    });
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    this.imagenesArchivos = Array.from(files);

    this.imagenesPreview = [];
    for (const file of this.imagenesArchivos) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesPreview.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.imagenesArchivos.splice(index, 1);
    this.imagenesPreview.splice(index, 1);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const habitacion: Habitacion = {
      id: this.editMode ? this.habitacionId! : 0, // si estás editando usa el id existente, sino 0
      activo: true,
      ...this.form.value, // copia los campos del formulario (estado, tipo, etc.)
      imagenes: [] // el post inicial de habitacion no incluye imágenes
    };
    this.loading = true;

    if (this.editMode && this.habitacionId) {
      // === EDITAR HABITACIÓN ===
      this.habService.updateHabitacion(habitacion).subscribe({
        next: () => {
          this.subirImagenes(this.habitacionId!);
        },
        error: () => {
          this.loading = false;
          alert('Error al actualizar la habitación.');
        }
      });
    } else {
      // === CREAR HABITACIÓN ===
      this.habService.postHabitacion(habitacion).subscribe({
        next: (res) => {
          const newId = res.id;
          this.subirImagenes(newId);
        },
        error: () => {
          this.loading = false;
          alert('Error al guardar la habitación.');
        }
      });
    }
  }

  subirImagenes(habitacionId: number) {
    if (this.imagenesArchivos.length === 0) {
      this.finalizarGuardado();
      return;
    }

    let subidas = 0;
    for (const file of this.imagenesArchivos) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const payload = { archivo: base64 };

        this.imgService.postImagen(habitacionId, payload).subscribe({
          next: () => {
            subidas++;
            if (subidas === this.imagenesArchivos.length) {
              this.finalizarGuardado();
            }
          },
          error: (err) => {
            console.error('Error al subir imagen:', err);
            alert('Ocurrió un error al subir las imágenes.');
            this.finalizarGuardado();
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  finalizarGuardado() {
    this.loading = false;
    alert(this.editMode ? 'Habitación actualizada correctamente.' : 'Habitación creada con éxito.');
    this.router.navigate(['/listado_habitaciones']);
  }

  volver() {
    this.router.navigate(['/listado_habitaciones']);
  }
}
