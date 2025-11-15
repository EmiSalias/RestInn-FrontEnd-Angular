import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private route: ActivatedRoute
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

      const forward: any = {};
      ['habitacionId', 'capacidad', 'ingreso', 'salida', 'fechaIngreso', 'fechaSalida']
        .forEach(k => { const v = qp.get(k); if (v) forward[k] = v; });

      this.router.navigate([returnUrl], { queryParams: forward });
    },
    error: err => {
      this.errorMessage = err.error?.message || 'Credenciales inválidas';
    }
  });
}

  goToRecovery(): void {
    const qp = this.route.snapshot.queryParamMap;
    const forward: any = {};
    ['habitacionId', 'capacidad', 'ingreso', 'salida', 'fechaIngreso', 'fechaSalida', 'returnUrl']
      .forEach(k => { const v = qp.get(k); if (v) forward[k] = v; });

    this.router.navigate(['/recovery'], { queryParams: forward });
  }

}
