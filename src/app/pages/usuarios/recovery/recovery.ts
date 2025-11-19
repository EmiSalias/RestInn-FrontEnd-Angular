import { Component, OnInit, inject }                                                from '@angular/core';
import { CommonModule }                                                             from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router }                                                   from '@angular/router';
import { AuthService }                                                              from '../../../services/auth-service';

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
  loading                 = false;
  errorMsg: string | null = null;
  infoMsg: string | null  = null;
  username: string | null = null;

  // Paso 1: email
  emailCtrl = this.fb.control('', [Validators.required, Validators.email]);

  // Paso 2: código (mismo esquema que en SignUp)
  codeForm: FormGroup = this.fb.group({
    d1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
    d6: ['', [Validators.required, Validators.pattern(/^\d$/)]],
  });

  // Paso 3: nueva contraseña
  passForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  }, { validators: samePassword });

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.step = 'code';
      this.setCodeFromString(code);
    }
  }

  get cf() {
    return this.codeForm.controls as any;
  }

  private getCodeFromForm(): string {
    const v = this.codeForm.value as any;
    return `${v.d1 ?? ''}${v.d2 ?? ''}${v.d3 ?? ''}${v.d4 ?? ''}${v.d5 ?? ''}${v.d6 ?? ''}`;
  }

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

  // #region Paso 1: enviar mail
  onStart(): void {
    if (this.emailCtrl.invalid) {
      this.emailCtrl.markAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.infoMsg = null;

    this.auth.startRecovery(this.emailCtrl.value!).subscribe({
      next: (res) => {
        console.log('[Recovery] startRecovery OK', res);
        this.loading = false;
        this.infoMsg = res.message;
        this.step = 'code';
        this.codeForm.reset();
      },
      error: (err) => {
        console.error('[Recovery] startRecovery ERROR', err);
        this.loading = false;
        if (err.status >= 500) {
          this.infoMsg = 'Si el mail existe recibirá un código de recuperación.';
          this.errorMsg = null;
          this.step = 'code';
        } else {
          this.errorMsg =
            err?.error?.message || 'No se pudo iniciar la recuperación.';
        }
      }
    });
  }
  // #endregion 

  // #region Paso 2: verificar código
  onVerifyCode(): void {
    const code = this.getCodeFromForm();

    if (!/^\d{6}$/.test(code)) {
      this.errorMsg = 'Ingresá los 6 dígitos del código.';
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.infoMsg = null;

    this.auth.verifyRecovery(code).subscribe({
      next: (res) => {
        this.loading = false;
        this.username = res.username;
        this.step = 'reset';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message || 'Código inválido o expirado.';
      }
    });
  }
  // #endregion 

  // #region Paso 3: resetear contraseña
  onReset(): void {
    if (this.passForm.invalid) {
      this.passForm.markAllAsTouched();
      return;
    }

    const code = this.getCodeFromForm();

    this.loading = true;
    this.errorMsg = null;
    this.infoMsg = null;

    this.auth.resetPassword({
      code,
      newPassword: this.passForm.value.password!
    }).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'done';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message || 'No se pudo actualizar la contraseña.';
      }
    });
  }

  focusNext(current: HTMLInputElement, next: HTMLInputElement | null): void {
    if (current.value.length > 0 && next) {
      next.focus();
    }
  }

  focusPrev(current: HTMLInputElement, prev: HTMLInputElement | null): void {
    if (current.value.length === 0 && prev) {
      prev.focus();
    }
  }
  // #endregion 

  goToSignIn(): void {
    this.router.navigate(['/sign_in']);
  }

  backToEmail(): void {
    this.step = 'email';
    this.infoMsg = null;
    this.errorMsg = null;
    this.loading = false;
    this.codeForm.reset();
    this.passForm.reset();
  }
}
