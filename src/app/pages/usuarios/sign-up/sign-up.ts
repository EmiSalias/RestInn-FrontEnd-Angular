// src/app/pages/auth/sign-up/sign-up.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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
  styleUrl: './sign-up.css'
})
export class SignUp implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  step: 'form' | 'verify' | 'success' = 'form';
  loading = false;
  errorMsg: string | null = null;
  infoMsg:  string | null = null;

  // guardo params de retorno para después redirigir a SignIn
  preservedParams: any = {};

  form: FormGroup = this.fb.group({
    nombre:       ['', [Validators.required, Validators.minLength(2)]],
    apellido:     ['', [Validators.required, Validators.minLength(2)]],
    nombreLogin:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email:        ['', [Validators.required, Validators.email]],
    dni:          ['', [Validators.pattern(/^\d{7,10}$/)]],
    phoneNumber:  ['', [Validators.pattern(/^[\d\s+\-()]{6,20}$/)]],
    cuit:         ['', [Validators.pattern(/^\d{11}$/)]],
    passGroup: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm:  ['', [Validators.required]]
    }, { validators: samePassword })
  });

  codeCtrl = this.fb.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]);

  ngOnInit(): void {
    // preservar returnUrl / habitacionId / capacidad / fechas si vienen
    const qp = this.route.snapshot.queryParamMap;
    ['returnUrl','habitacionId','capacidad','ingreso','salida','fechaIngreso','fechaSalida']
      .forEach(k => { const v = qp.get(k); if (v) this.preservedParams[k] = v; });

    // Si llega ?code=XYZ (por click del mail) verificamos directo
    const codeParam = qp.get('code');
    if (codeParam) {
      this.step = 'verify';
      this.codeCtrl.setValue(codeParam);
      this.onVerify();
    }
  }

  get f() { return this.form.controls as any; }
  get pass() { return (this.form.get('passGroup') as any).controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
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

    this.loading = true; this.errorMsg = null; this.infoMsg = null;
    this.auth.registerInitiate(dto).subscribe({
      next: (res) => {
        this.loading = false;
        this.step = 'verify';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message ??
          (err.status === 409 ? 'Usuario o email ya registrados' : 'No se pudo iniciar el registro');
      }
    });
  }

  onVerify(): void {
    if (this.codeCtrl.invalid) { this.codeCtrl.markAsTouched(); return; }
    this.loading = true; this.errorMsg = null; this.infoMsg = null;

    this.auth.verifyRegistration(this.codeCtrl.value as string).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'success';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Código inválido o expirado';
      }
    });
  }

  goToSignIn(): void {
    this.router.navigate(['/sign-in'], { queryParams: this.preservedParams });
  }
}
