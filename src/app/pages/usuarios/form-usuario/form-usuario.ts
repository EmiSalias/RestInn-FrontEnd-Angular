import { Component, OnInit, inject }                                                from '@angular/core';
import { CommonModule }                                                             from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService }                                                              from '../../../services/auth-service';
import { UserService }                                                              from '../../../services/user-service';
import   User                                                                       from '../../../models/User';
import   Swal                                                                       from 'sweetalert2';

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

  private fb          = inject(FormBuilder);
  private auth        = inject(AuthService);
  private userService = inject(UserService);

  // Pestaña activa: 'datos' | 'seguridad'
  activeTab: 'datos' | 'seguridad' = 'datos';

  form: FormGroup = this.fb.group({
    nombre:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+$/)]],
    apellido:     ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25), Validators.pattern(/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+$/)]],
    nombreLogin:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email:        ['', [Validators.required, Validators.email]],
    dni:          ['', [Validators.pattern(/^\d{7,10}$/)]],
    phoneNumber:  ['', [Validators.pattern(/^\+54\s?\d{2,4}[\s\-]?\d{6,8}$/)]],
    cuit:         ['', [Validators.pattern(/^\d{11}$/)]],
    role:         [''],

    passGroup: this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required]],
        confirm: ['', [Validators.required]],
      },
      { validators: samePassword }
    ),
  });

  user: User | null   = null;
  role: string | null = null;
  isAdmin             = false;
  isCliente           = false;
  isEmpleado          = false;
  canEditProfileData  = false;
  loading             = false;
  errorMsg: string | null = null;
  infoMsg: string | null  = null;

  get f() {
    return this.form.controls as any;
  }

  get pg() {
    return (this.form.get('passGroup') as FormGroup).controls as any;
  }

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
    this.form.get('nombreLogin')?.disable();
    this.form.get('email')?.disable();
    this.form.get('dni')?.disable();
    this.form.get('cuit')?.disable();
    this.form.get('role')?.disable();

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
    const wantsPasswordChange = !!(passValue.oldPassword || passValue.newPassword || passValue.confirm);

    if (!wantsPasswordChange && !this.form.dirty) {
      this.errorMsg = 'No se han realizado cambios.';
      Swal.fire({
        icon: 'error',
        title: 'No hay cambios',
        text: 'No has realizado ningún cambio en tus datos.',
        showConfirmButton: true,
      });
      return;
    }

    // Validación de nombre, apellido, teléfono
    if (this.form.get('nombre')?.invalid || this.form.get('apellido')?.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error en los datos',
        text: 'El nombre y apellido deben tener entre 2 y 25 caracteres.',
        showConfirmButton: true,
      });
      return;
    }

    if (this.form.get('phoneNumber')?.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error en teléfono',
        text: 'El teléfono solo puede contener números, espacios, guiones y paréntesis.',
        showConfirmButton: true,
      });
      return;
    }

    // Validación de la contraseña
    if (wantsPasswordChange) {
      if (!passValue.oldPassword || !passValue.newPassword || !passValue.confirm) {
        passGroup.markAllAsTouched();
        this.errorMsg = 'Completá los tres campos de contraseña.';
        Swal.fire({
          icon: 'error',
          title: 'Faltan campos de contraseña',
          text: 'Debe completar todos los campos de contraseña.',
          showConfirmButton: true,
        });
        return;
      }

      if (passValue.newPassword.length < 8) {
        this.errorMsg = 'La nueva contraseña debe tener al menos 8 caracteres.';
        Swal.fire({
          icon: 'error',
          title: 'Contraseña demasiado corta',
          text: 'La nueva contraseña debe tener al menos 8 caracteres.',
          showConfirmButton: true,
        });
        return;
      }

      if (passGroup.hasError('mismatch')) {
        this.errorMsg = 'Las nuevas contraseñas no coinciden.';
        Swal.fire({
          icon: 'error',
          title: 'Las contraseñas no coinciden',
          text: 'Las contraseñas nuevas no coinciden. Verifique e intente nuevamente.',
          showConfirmButton: true,
        });
        return;
      }

      const passwordUpdateData = {
        oldPassword: passValue.oldPassword,
        newPassword: passValue.newPassword,
      };

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
      // Actualiza los datos si no hay cambios en la contraseña
      this.userService.updateCurrentUser(this.form.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Datos actualizados correctamente',
            showConfirmButton: false,
            timer: 1500,
          });
          this.infoMsg = 'Datos actualizados correctamente.';
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar datos',
            text: err?.error?.message || 'No se pudieron guardar los cambios.',
            showConfirmButton: true,
          });
          this.errorMsg = err?.error?.message || 'No se pudieron guardar los cambios.';
        },
      });
    }
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get canShowSaveButton(): boolean {
    if (this.activeTab === 'seguridad') {
      return true;
    }
    return this.canEditProfileData;
  }

}
