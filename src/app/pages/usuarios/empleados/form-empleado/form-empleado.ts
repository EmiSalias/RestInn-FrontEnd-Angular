import { Component, inject, OnInit }                                from '@angular/core';
import { CommonModule, Location  }                                  from '@angular/common';
import { Router, RouterLink }                                                   from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule }  from '@angular/forms';
import { UserService }                                              from '../../../../services/user-service';
import { RolEmpleado }                                              from '../../../../models/enums/E_Rol';
import   Swal                                                       from 'sweetalert2';
import { ActivatedRoute }                                           from '@angular/router';

@Component({
  selector: 'app-form-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-empleado.html',
  styleUrls: ['./form-empleado.css']
})
export class FormEmpleado implements OnInit {
  form: FormGroup;
  roles                     = Object.values(RolEmpleado);
  private location          = inject(Location);
  errorMsg: string | null   = null;
  showAdditionalFields      = false;
  employeeId: string | null = null;
  isEditing                 = false;

  constructor(
    private fb: FormBuilder,
    private userSrv: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      rolEmpleado: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      nombreLogin: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], 
      activo: [true]
    });

  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');

    if (this.employeeId) {
      this.isEditing = true;
      this.loadEmployeeData(this.employeeId);
    } else {
      const passCtrl = this.form.get('password');
      passCtrl?.setValidators([Validators.required, Validators.minLength(8)]);
      passCtrl?.updateValueAndValidity();
    }
  }

  loadEmployeeData(id: string) {
    this.userSrv.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.form.patchValue({
          rolEmpleado: employee.role,
          nombre: employee.nombre,
          apellido: employee.apellido,
          nombreLogin: employee.nombreLogin,
          dni: employee.dni,
          phoneNumber: employee.phoneNumber,
          email: employee.email,
          activo: employee.activo,
          password: ''
        });
      },
      error: (err) => {
        this.errorMsg = 'No se pudo cargar la información del empleado.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMsg,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff6b6b'
        });
      }
    });
  }

  onRoleChange() {
    this.showAdditionalFields = true;
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.isEditing) {
        this.updateEmployee();
      } else {
        this.createEmployee();
      }
    }
  }

  createEmployee() {
    this.userSrv.createEmployee(this.form.value).subscribe({
      next: (user) => {
        Swal.fire({
          icon: 'success',
          title: 'Empleado creado con éxito',
          text: `El empleado ${user.nombre} ha sido creado correctamente.`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#f1c36f'
        }).then(() => {
          this.router.navigate(['/empleados']);
        });
      },
      error: (err) => {
        console.error('Error al crear empleado', err);

        let msg = 'No se pudo crear el empleado.';

        if (err.status === 0) {
          msg = 'No se pudo contactar al servidor. Verificá tu conexión.';
        }
        else if (err.error) {
          if (err.error.mensaje) {
            msg = err.error.mensaje;
          } else if (err.error.message) {
            msg = err.error.message;
          }
          if (err.status === 400 && err.error.errores) {
            const detalles = Object.values(err.error.errores as { [k: string]: string })
              .join('\n');
            msg = `${msg}\n${detalles}`;
          }
        }

        this.errorMsg = msg;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          html: msg.replace(/\n/g, '<br>'),
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff6b6b'
        });
      }
    });
  }

  updateEmployee() {
    const employeeData: any = { ...this.form.value };

    if (!employeeData.password) {
      delete employeeData.password;
    }

    this.userSrv.updateEmployee(this.employeeId!, employeeData).subscribe({
      next: (user) => {
        Swal.fire({
          icon: 'success',
          title: 'Empleado actualizado',
          text: `El empleado ${user.nombre} ha sido actualizado correctamente.`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#f1c36f'
        }).then(() => {
          this.router.navigate(['/empleados']);
        });
      },
      error: (err) => {
        this.errorMsg = 'No se pudo actualizar el empleado.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMsg,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff6b6b'
        });
      }
    });
  }

  toggleEmployeeStatus() {
    if (this.form.value.activo) {
      this.markAsInactive();
    } else {
      this.markAsActive();
    }
  }

  markAsInactive() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Este empleado será marcado como inactivo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userSrv.borrarLogicoEmpleado(this.employeeId!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Empleado desactivado',
              text: 'El empleado ha sido marcado como inactivo.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#f1c36f'
            }).then(() => {
              this.router.navigate(['/empleados']);
            });
          },
          error: (err) => {
            this.errorMsg = 'No se pudo desactivar al empleado.';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.errorMsg,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ff6b6b'
            });
          }
        });
      }
    });
  }

  markAsActive() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Este empleado será activado nuevamente.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userSrv.activateEmployee(this.employeeId!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Empleado activado',
              text: 'El empleado ha sido activado nuevamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#4CAF50'
            }).then(() => {
              this.router.navigate(['/empleados']);
            });
          },
          error: (err) => {
            this.errorMsg = 'No se pudo activar al empleado.';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.errorMsg,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ff6b6b'
            });
          }
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }

  resetPassword() {
    if (!this.employeeId) {
      return;
    }

    Swal.fire({
      title: 'Restablecer contraseña',
      html: `
      <input type="password" id="swal-new-pass" class="swal2-input" placeholder="Nueva contraseña">
      <input type="password" id="swal-new-pass2" class="swal2-input" placeholder="Confirmar contraseña">
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f1c36f',
      preConfirm: () => {
        const p1 = (document.getElementById('swal-new-pass') as HTMLInputElement).value;
        const p2 = (document.getElementById('swal-new-pass2') as HTMLInputElement).value;

        if (!p1 || !p2) {
          Swal.showValidationMessage('Completá ambos campos');
          return;
        }

        if (p1 !== p2) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return;
        }

        if (p1.length < 8) {
          Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres');
          return;
        }

        return p1;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.userSrv.resetEmployeePassword(this.employeeId!, result.value).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Contraseña actualizada',
              text: 'La contraseña del empleado se actualizó correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#f1c36f'
            });
          },
          error: (err) => {
            let msg = 'No se pudo actualizar la contraseña.';

            if (err.status === 0) {
              msg = 'No se pudo contactar al servidor.';
            } else if (err.error?.mensaje) {
              msg = err.error.mensaje;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: msg,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ff6b6b'
            });
          }
        });
      }
    });
  }

}
