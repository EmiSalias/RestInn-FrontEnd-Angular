// src/app/pages/auth/sign-up/sign-up.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, UsuarioRequest } from '../../../services/auth-service';

function samePassword(group: AbstractControl) {
  const p = group.get('password')?.value;
  const c = group.get('confirm')?.value;
  return p && c && p === c ? null : { mismatch: true };
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  step: 'form' | 'verify' | 'success' = 'form';
  loading = false;
  errorMsg: string | null = null;
  infoMsg: string | null = null;

  preservedParams: any = {};

  // ---------- FORM PRINCIPAL ----------
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    nombreLogin: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]],
    email: ['', [Validators.required, Validators.email]],
    dni: ['', [Validators.pattern(/^\d{7,10}$/)]],
    phoneNumber: ['', [Validators.pattern(/^[\d\s+\-()]{6,20}$/)]],
    cuit: ['', [Validators.pattern(/^\d{11}$/)]],
    passGroup: this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm: ['', [Validators.required]],
      },
      { validators: samePassword }
    ),
  });

  // ---------- FORM DEL CÓDIGO (6 dígitos, 6 inputs) ----------
  codeForm: FormGroup = this.fb.group({
    d1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
  });

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    [
      'returnUrl',
      'habitacionId',
      'capacidad',
      'ingreso',
      'salida',
      'fechaIngreso',
      'fechaSalida',
    ].forEach(k => {
      const v = qp.get(k);
      if (v) this.preservedParams[k] = v;
    });

    // si viene ?code=XXXXXX desde el mail, lo metemos en el codeForm
    const codeParam = qp.get('code');
    if (codeParam) {
      this.step = 'verify';
      this.setCodeFromString(codeParam!);
    }
  }

  get f() { return this.form.controls as any; }
  get pass() { return (this.form.get('passGroup') as any).controls; }
  get c() { return this.codeForm.controls as any; }

  // ---------- Paso 1: envío del formulario ----------
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const dto: UsuarioRequest = {
      nombre: raw.nombre,
      apellido: raw.apellido,
      nombreLogin: raw.nombreLogin,
      email: raw.email,
      password: raw.passGroup.password,
      dni: raw.dni || undefined,
      phoneNumber: raw.phoneNumber || undefined,
      cuit: raw.cuit || undefined,
    };

    this.loading = true;
    this.errorMsg = null;
    this.infoMsg = null;

    this.auth.registerInitiate(dto).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'verify';
        this.infoMsg = 'Te enviamos un código de verificación a tu correo.';
        this.codeForm.reset(); // limpiamos por las dudas
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message ??
          (err.status === 409
            ? 'Usuario o email ya registrados'
            : 'No se pudo iniciar el registro');
      },
    });
  }

  // arma el código a partir del codeForm
  private getCodeFromForm(): string {
    const v = this.codeForm.value as any;
    return `${v.d1 ?? ''}${v.d2 ?? ''}${v.d3 ?? ''}${v.d4 ?? ''}${v.d5 ?? ''}${v.d6 ?? ''}`;
  }

  // precarga desde ?code=XXXXXX
  private setCodeFromString(code: string): void {
    const clean = (code || '').replace(/\D/g, '').slice(0, 6);
    const arr = clean.split('');
    this.codeForm.setValue({
      d1: arr[0] ?? '',
      d2: arr[1] ?? '',
      d3: arr[2] ?? '',
      d4: arr[3] ?? '',
      d5: arr[4] ?? '',
      d6: arr[5] ?? '',
    }, { emitEvent: false });
  }

  // ---------- Paso 2: verificar código ----------
  onVerify(): void {
    const code = this.getCodeFromForm();

    if (!/^\d{6}$/.test(code)) {
      this.errorMsg = 'Ingresá los 6 dígitos del código.';
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.infoMsg = null;

    this.auth.verifyRegistration(code).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'success';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Código inválido o expirado';
      },
    });
  }

  // Mueve el foco al siguiente input si se escribió algo
  focusNext(current: HTMLInputElement, next: HTMLInputElement | null): void {
    if (current.value.length > 0 && next) {
      next.focus();
    }
  }

  // Mueve el foco al anterior si se borra en un campo vacío
  focusPrev(current: HTMLInputElement, prev: HTMLInputElement | null): void {
    if (current.value.length === 0 && prev) {
      prev.focus();
    }
  }

  backToForm(): void {
    this.step = 'form';
    this.errorMsg = null;
    this.infoMsg = null;
  }

  goToSignIn(): void {
    this.router.navigate(['/sign_in'], { queryParams: this.preservedParams });
  }
}
