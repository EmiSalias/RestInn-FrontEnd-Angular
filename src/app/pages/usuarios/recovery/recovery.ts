// src/app/pages/auth/recovery/recovery.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

function samePassword(group: AbstractControl) {
  const p = group.get('password')?.value;
  const c = group.get('confirm')?.value;
  return p && c && p === c ? null : { mismatch: true };
}

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recovery.html',
  styleUrl: './recovery.css'
})
export class Recovery implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  step: 'email' | 'code' | 'reset' | 'done' = 'email';
  loading = false;
  errorMsg: string | null = null;
  infoMsg: string | null = null;
  username: string | null = null; // opcional, lo devuelve /verify

  emailCtrl = this.fb.control('', [Validators.required, Validators.email]);
  codeCtrl  = this.fb.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]);
  passForm  = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm:  ['', [Validators.required]],
  }, { validators: samePassword });

  ngOnInit(): void {
    // si llega ?code=xxxx, saltear al paso de verificar
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.step = 'code';
      this.codeCtrl.setValue(code);
      this.onVerifyCode();
    }
  }

  // Paso 1
  onStart(): void {
    if (this.emailCtrl.invalid) { this.emailCtrl.markAsTouched(); return; }
    this.loading = true; this.errorMsg = null; this.infoMsg = null;
    this.auth.startRecovery(this.emailCtrl.value!).subscribe({
      next: (res) => { this.loading = false; this.step = 'code'; this.infoMsg = res.message; },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'No se pudo iniciar la recuperación.'; }
    });
  }

  // Paso 2
  onVerifyCode(): void {
    if (this.codeCtrl.invalid) { this.codeCtrl.markAsTouched(); return; }
    this.loading = true; this.errorMsg = null; this.infoMsg = null;
    this.auth.verifyRecovery(this.codeCtrl.value!).subscribe({
      next: (res) => { this.loading = false; this.username = res.username; this.step = 'reset'; },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Código inválido o expirado.'; }
    });
  }

  // Paso 3
  onReset(): void {
    if (this.passForm.invalid) { this.passForm.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = null; this.infoMsg = null;
    this.auth.resetPassword({ code: this.codeCtrl.value!, newPassword: this.passForm.value.password! })
      .subscribe({
        next: () => { this.loading = false; this.step = 'done'; },
        error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'No se pudo actualizar la contraseña.'; }
      });
  }

  goToSignIn(): void { this.router.navigate(['/sign-in']); }
}
