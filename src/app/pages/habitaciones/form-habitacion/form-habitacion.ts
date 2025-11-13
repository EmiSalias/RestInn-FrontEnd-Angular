import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HabitacionService } from '../../../services/habitacion-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-habitacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './form-habitacion.html',
  styleUrls: ['./form-habitacion.css']
})
export class FormHabitacionComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  loading = false;
  imagenesPreview: string[] = [];
  habitacionId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private habService: HabitacionService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [0],
      activo: [true],
      estado: ['', Validators.required],
      tipo: ['', Validators.required],
      numero: [null, Validators.required],
      piso: [0],
      capacidad: [1, Validators.required],
      cantCamas: [1, Validators.required],
      precioNoche: [0, Validators.required],
      comentario: [''],
      imagenes: [[]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.habitacionId = +id;
      this.loadHabitacion(+id);
    }
  }

  loadHabitacion(id: number) {
    this.habService.getHabitacion(id).subscribe({
      next: (data: Habitacion) => {
        this.form.patchValue(data);
        this.imagenesPreview = data.imagenes?.map(img => `data:${img.tipo};base64,${img.datosBase64}`) || [];
      },
      error: err => {
        console.error('Error al cargar habitación:', err);
        alert('No se pudo cargar la habitación.');
        this.router.navigate(['/listado_habitaciones']);
      }
    });
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result.split(',')[1];
        const imagenObj = {
          id: 0,
          nombre: file.name,
          tipo: file.type,
          datosBase64: base64
        };

        const imagenes = this.form.get('imagenes')?.value || [];
        this.form.patchValue({ imagenes: [...imagenes, imagenObj] });
        this.imagenesPreview.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.imagenesPreview.splice(index, 1);
    const imgs = [...this.form.get('imagenes')?.value];
    imgs.splice(index, 1);
    this.form.patchValue({ imagenes: imgs });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const habitacion = this.form.value as Habitacion;

    const obs = this.editMode
      ? this.habService.updateHabitacion(habitacion)
      : this.habService.postHabitacion(habitacion);

    obs.subscribe({
      next: () => {
        alert(this.editMode ? 'Habitación actualizada' : 'Habitación creada');
        this.router.navigate(['/listado_habitaciones']);
      },
      error: err => {
        console.error('Error al guardar:', err);
        alert('Error al guardar habitación.');
      },
      complete: () => this.loading = false
    });
  }

  volver() {
    this.router.navigate(['/listado_habitaciones']);
  }
}
