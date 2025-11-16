import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth-service';
import { UserService } from '../../../services/user-service';
import User from '../../../models/User';
import Swal from 'sweetalert2';

function samePassword(group: AbstractControl) {
  const newPass = group.get('newPassword')?.value;
  const confirm = group.get('confirm')?.value;
  return newPass && confirm && newPass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-usuario.html',
  styleUrl: './form-usuario.css'
})
export class FormUsuario implements OnInit {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);

  // pestaña activa: 'datos' | 'seguridad'
  activeTab: 'datos' | 'seguridad' = 'datos';

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.minLength(2)]],
    apellido: ['', [Validators.minLength(2)]],
    nombreLogin: [''],
    email: [''],
    dni: [''],
    phoneNumber: ['', [Validators.pattern(/^[\d\s+\-()]{6,20}$/)]],
    cuit: [''],
    role: [''],

    passGroup: this.fb.group(
      {
        oldPassword: [''],
        newPassword: ['', [Validators.minLength(8)]],
        confirm: [''],
      },
      { validators: samePassword }
    ),
  });

  user: User | null = null;
  role: string | null = null;

  isAdmin = false;
  isCliente = false;
  isEmpleado = false;
  canEditProfileData = false;

  loading = false;
  errorMsg: string | null = null;
  infoMsg: string | null = null;

  get f() { return this.form.controls as any; }
  get pg() { return (this.form.get('passGroup') as FormGroup).controls as any; }

  ngOnInit(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (u) => {
        this.loading = false;
        this.user = u;
        this.role = u.role;

        this.isAdmin = u.role === 'ADMINISTRADOR';
        this.isCliente = u.role === 'CLIENTE';
        this.isEmpleado = !this.isAdmin && !this.isCliente;

        this.canEditProfileData = this.isAdmin || this.isCliente;

        // si es empleado, que entre directo en "Seguridad"
        this.activeTab = this.isEmpleado ? 'seguridad' : 'datos';

        this.form.patchValue({
          nombre: u.nombre,
          apellido: u.apellido,
          nombreLogin: u.nombreLogin,
          email: u.email,
          dni: u.dni,
          phoneNumber: u.phoneNumber,
          cuit: u.cuit,
          role: u.role
        });

        this.applyRolePermissions();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'No se pudo cargar tu perfil.';
      }
    });
  }

  private applyRolePermissions(): void {
    // Estos campos nunca se editan desde acá
    this.form.get('nombreLogin')?.disable();
    this.form.get('email')?.disable();
    this.form.get('dni')?.disable();
    this.form.get('cuit')?.disable();
    this.form.get('role')?.disable();

    // Empleados: tampoco editan nombre / apellido / teléfono
    if (!this.canEditProfileData) {
      this.form.get('nombre')?.disable();
      this.form.get('apellido')?.disable();
      this.form.get('phoneNumber')?.disable();
    }
  }

  setTab(tab: 'datos' | 'seguridad') {
    this.activeTab = tab;
    this.errorMsg = null;
    this.infoMsg = null;
  }

  guardar(): void {
    this.errorMsg = null;
    this.infoMsg = null;

    const passGroup = this.form.get('passGroup') as FormGroup;
    const passValue = passGroup.value;
    const wantsPasswordChange =
      !!(passValue.oldPassword || passValue.newPassword || passValue.confirm);

    // Si no hay cambios en los campos de contraseña y no hay cambios en otros datos, muestra un error.
    if (!wantsPasswordChange && !this.form.dirty) {
      this.errorMsg = 'No se han realizado cambios.';
      return;
    }

    // Validación de los campos de contraseña
    if (wantsPasswordChange) {
      // Asegúrate de que los tres campos estén completos
      if (!passValue.oldPassword || !passValue.newPassword || !passValue.confirm) {
        passGroup.markAllAsTouched();
        this.errorMsg = 'Completá los tres campos de contraseña.';
        return;
      }

      // Verifica que la nueva contraseña tenga al menos 8 caracteres
      if (passValue.newPassword.length < 8) {
        this.errorMsg = 'La nueva contraseña debe tener al menos 8 caracteres.';
        return;
      }

      // Verifica que las nuevas contraseñas coincidan
      if (passGroup.hasError('mismatch')) {
        this.errorMsg = 'Las nuevas contraseñas no coinciden.';
        return;
      }

      // Si todo está correcto, envía la solicitud para actualizar la contraseña
      const passwordUpdateData = {
        oldPassword: passValue.oldPassword,
        newPassword: passValue.newPassword,
        confirmPassword: passValue.confirm,
      };

      // Llama al servicio para actualizar la contraseña
      this.userService.updatePassword(passwordUpdateData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada correctamente',
            showConfirmButton: false,
            timer: 1500,
          });
          this.infoMsg = 'Contraseña actualizada correctamente.';
          passGroup.reset();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar la contraseña',
            text: err?.error?.message || 'No se pudieron guardar los cambios de la contraseña.',
            showConfirmButton: true,
          });
          this.errorMsg = err?.error?.message || 'No se pudieron guardar los cambios de la contraseña.';
        },
      });
    } else {
      // Si no se cambia la contraseña, solo actualiza otros datos del usuario
      this.userService.updateCurrentUser(this.form.value).subscribe({
        next: () => {
          this.infoMsg = 'Datos actualizados correctamente.';
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudieron guardar los cambios.';
        },
      });
    }
  }
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
