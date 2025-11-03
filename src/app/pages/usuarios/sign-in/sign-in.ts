import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';   // 👈 agrega ActivatedRoute

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute            // 👈 inyéctalo
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe({
      next: () => {
        const qp = this.route.snapshot.queryParamMap;

        const returnUrl = qp.get('returnUrl') || '/';
        const habitacionId = qp.get('habitacionId');

        // ⬇️ Propagamos fechas (aceptamos alias por las dudas)
        const ingreso = qp.get('ingreso') ?? qp.get('fechaIngreso') ?? qp.get('fi');
        const salida = qp.get('salida') ?? qp.get('fechaSalida') ?? qp.get('fs');

        const queryParams: any = {};
        if (habitacionId) queryParams.habitacionId = habitacionId;
        if (ingreso) queryParams.ingreso = ingreso;   // YYYY-MM-DD
        if (salida) queryParams.salida = salida;

        const forward: any = {};
        ['habitacionId', 'capacidad', 'ingreso', 'salida', 'fechaIngreso', 'fechaSalida']
          .forEach(k => { const v = qp.get(k); if (v) forward[k] = v; });

        this.router.navigate([returnUrl], { queryParams: forward });
        // Si querés ser ultra-tolerante con URLs que ya traigan params:
        // this.router.navigate([returnUrl], { queryParams, queryParamsHandling: 'merge' });
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Credenciales inválidas';
      }
    });
  }

}
