import { Component, OnInit, inject }                                from '@angular/core';
import { CommonModule }                                             from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule }  from '@angular/forms';
import { Router }                                                   from '@angular/router';
import { switchMap }                                                from 'rxjs/operators';
import { UserService }                                              from '../../../services/user-service';
import   User                                                       from '../../../models/User';

@Component({
  selector: 'app-editar-perfil-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-perfil-usuario.html',
  styleUrl: './editar-perfil-usuario.css'
})
export class EditarPerfilUsuario implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    nombre:       ['', [Validators.required, Validators.minLength(2)]],
    apellido:     ['', [Validators.required, Validators.minLength(2)]],
    nombreLogin:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email:        ['', [Validators.required, Validators.email]],
    dni:          ['', [Validators.pattern(/^\d{7,10}$/)]],
    phoneNumber:  ['', [Validators.pattern(/^[\d\s+\-()]{6,20}$/)]],
    cuit:         ['', [Validators.pattern(/^\d{11}$/)]]
  });

  loading                 = false;
  errorMsg: string | null = null;
  user: User | null       = null;

  get f() {
    return this.form.controls as any;
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.user = user,
      error: () => this.errorMsg = 'No se pudo cargar el perfil'
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading  = true;
    this.errorMsg = null;
    const dto     = this.form.value;

    this.userService.getCurrentUser().pipe(
      switchMap((current) => this.userService.updateCurrentUser({ ...dto, id: current.id }))
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/mi_perfil']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo guardar';
      }
    });
  }
}