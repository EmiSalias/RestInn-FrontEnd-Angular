import { Component, OnInit, inject }        from '@angular/core';
import { CommonModule }                     from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidatorFn
}                                           from '@angular/forms';
import { ActivatedRoute, Router }           from '@angular/router';
import { ReservasService }  from '../../../services/reservas-service';
import   Habitacion                         from '../../../models/Habitacion';
import { HabitacionService }                from '../../../services/habitacion-service';
import { ImagenService }                    from '../../../services/imagen-service';
import   Swal                               from 'sweetalert2';
import { AuthService } from '../../../services/auth-service';
import ReservaRequest from '../../../models/ReservaRequest';

function rangoFechasValidator(group: AbstractControl) {
  const fi = group.get('fechaIngreso')?.value as string | null;
  const fs = group.get('fechaSalida')?.value as string | null;
  if (!fi || !fs) return null;
  return fs > fi ? null : { rangoInvalido: true };
}

function arrayMaxLength(maxProvider: () => number): ValidatorFn {
  return (control: AbstractControl) => {
    const arr = control as FormArray;
    const max = maxProvider();
    return (Number.isFinite(max) && arr.length > max)
      ? { maxHuespedes: { max, actual: arr.length } }
      : null;
  };
}

@Component({
  selector: 'app-form-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-reserva.html',
  styleUrl: './form-reserva.css'
})
export class FormReserva implements OnInit {
  private fb          = inject(FormBuilder);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private reservasSrv = inject(ReservasService);
  private habSrv      = inject(HabitacionService);
  private imgSrv      = inject(ImagenService);
  private auth        = inject(AuthService);

  form: FormGroup = this.fb.group({
    habitacionId: [null, Validators.required],
    fechaIngreso: ['', Validators.required],
    fechaSalida: ['', Validators.required],
    huespedes: this.fb.array([this.nuevoHuesped()], { validators: Validators.minLength(1) })
  }, { validators: rangoFechasValidator });

  loading                 = false;
  errorMsg: string | null = null;
  todayStr                = new Date().toISOString().slice(0, 10);
  hab: Habitacion | null  = null;
  imgUrls: string[]       = [];
  selectedIdx             = 0;
  capacidadMax            = Number.MAX_SAFE_INTEGER;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
      const habitacionIdStr = qp.get('habitacionId');
      const capStr = qp.get('capacidad');
      const fi = qp.get('fechaIngreso') ?? qp.get('ingreso') ?? qp.get('fi');
      const fs = qp.get('fechaSalida') ?? qp.get('salida') ?? qp.get('fs');
      const isISO = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

      // Prefill form
      const patch: any = {};
      if (habitacionIdStr) patch.habitacionId = +habitacionIdStr;
      if (isISO(fi)) patch.fechaIngreso = fi!;
      if (isISO(fs)) patch.fechaSalida = fs!;
      if (Object.keys(patch).length) this.form.patchValue(patch, { emitEvent: false });

      // Setea capacidad al toque si viene por query
      if (capStr && !Number.isNaN(+capStr)) {
        this.capacidadMax = +capStr;
        while (this.huespedesFA.length > this.capacidadMax) {
          this.huespedesFA.removeAt(this.huespedesFA.length - 1);
        }
        this.refrescarValidadoresHuespedes();
      }

      // Carga data de respaldo/confirmación desde API
      const habitacionId = +(habitacionIdStr || this.form.get('habitacionId')?.value || 0);
      if (habitacionId) {
        this.cargarHabitacion(habitacionId);
        this.cargarImagenes(habitacionId);
      }
    });

    // si cambia desde UI, recargar datos y revalidar
    this.form.get('habitacionId')?.valueChanges.subscribe((v) => {
      const id = Number(v);
      if (id) {
        this.cargarHabitacion(id);
        this.cargarImagenes(id);
      }
    });

    this.refrescarValidadoresHuespedes();
  }

  get capacidadMaxLabel(): number | string {
    return (Number.isFinite(this.capacidadMax) && this.capacidadMax < Number.MAX_SAFE_INTEGER)
      ? this.capacidadMax
      : '—';
  }

  get canAddGuest(): boolean {
    return this.huespedesFA.length < this.capacidadMax;
  }


  private refrescarValidadoresHuespedes() {
    this.huespedesFA.setValidators([
      Validators.minLength(1),
      arrayMaxLength(() => this.capacidadMax)
    ]);
    this.huespedesFA.updateValueAndValidity({ emitEvent: false });
  }

  private cargarHabitacion(id: number) {
    this.habSrv.getHabitacion(id).subscribe({
      next: (h) => {
        this.hab = h;
        this.capacidadMax = Number(h?.capacidad ?? Number.MAX_SAFE_INTEGER);
        while (this.huespedesFA.length > this.capacidadMax) {
          this.huespedesFA.removeAt(this.huespedesFA.length - 1);
        }
        this.refrescarValidadoresHuespedes();
      },
      error: (e) => { console.error('No se pudo cargar la habitación', e); }
    });
  }

  get huespedesFA(): FormArray {
    return this.form.get('huespedes') as FormArray;
  }

  nuevoHuesped(): FormGroup {
    const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+$/;

    return this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(NAME_PATTERN)
        ]
      ],
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(NAME_PATTERN)
        ]
      ],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,10}$/)
        ]
      ]
    });
  }


  addHuesped() {
    if (!this.canAddGuest) return;
    this.huespedesFA.push(this.nuevoHuesped());
    this.refrescarValidadoresHuespedes();
  }
  removeHuesped(idx: number) { if (this.huespedesFA.length > 1) this.huespedesFA.removeAt(idx); }

  submit() {
    // Validación de capacidad
    if (this.huespedesFA.length > this.capacidadMax) {
      this.errorMsg = `Máximo ${this.capacidadMax} huésped(es) para esta habitación.`;

      Swal.fire({
        icon: 'warning',
        title: 'Capacidad superada',
        text: this.errorMsg,
      });

      return;
    }

    // Validación de formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Revisá los campos marcados en rojo.',
      });

      return;
    }

    const raw = this.form.value;
    const dto: ReservaRequest = {
      fechaIngreso: raw.fechaIngreso,
      fechaSalida: raw.fechaSalida,
      habitacionId: Number(raw.habitacionId),
      huespedes: raw.huespedes
    };

    this.loading = true;
    this.errorMsg = null;

    this.reservasSrv.crearReserva(dto).subscribe({
      next: (res) => {
        this.loading = false;

        // Popup de éxito y luego navegación al detalle
        Swal.fire({
          icon: 'success',
          title: 'Reserva creada',
          text: `Tu reserva se creó correctamente. Código: #${res.id}`,
          confirmButtonText: 'Ver detalle'
        }).then(() => {
          this.router.navigate(['/reserva', res.id], { replaceUrl: true });
        });
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.message ||
          'No se pudo crear la reserva. Verificá fechas y disponibilidad.';

        this.errorMsg = msg;

        Swal.fire({
          icon: 'error',
          title: 'No se pudo crear la reserva',
          text: msg,
        });
      }
    });
  }


  private cargarImagenes(habitacionId: number) {
    this.imgSrv.getUrlsPorHabitacion(habitacionId).subscribe({
      next: (urls) => {
        this.imgUrls = (urls ?? []).map(u => u.split('::')[1] ?? u);
        this.selectedIdx = 0;
      },
      error: (e) => { console.error('No se pudieron cargar imágenes', e); this.imgUrls = []; }
    });
  }

}
