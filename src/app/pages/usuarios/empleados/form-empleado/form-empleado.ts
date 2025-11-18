import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user-service';
import { RolEmpleado } from '../../../../models/enums/E_Rol';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-empleado.html',
  styleUrls: ['./form-empleado.css']
})
export class FormEmpleado implements OnInit {
  form: FormGroup;
  roles = Object.values(RolEmpleado);  // Cargar los roles disponibles
  errorMsg: string | null = null;
  showAdditionalFields = false;
  employeeId: string | null = null;  // Almacenar el ID del empleado
  isEditing = false;  // Determinar si estamos en modo edición

  constructor(
    private fb: FormBuilder,
    private userSrv: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Crear el formulario
    this.form = this.fb.group({
      rolEmpleado: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      nombreLogin: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],  // Contraseña nueva
      oldPassword: ['', []],  // Contraseña actual, solo si se quiere cambiar
      activo: [true]  // Activado por defecto
    });
  }

  ngOnInit(): void {
    // Obtener el ID del empleado de la URL
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.isEditing = true;
      this.loadEmployeeData(this.employeeId);  // Cargar datos si estamos editando
    }
  }

  // Función para cargar los datos del empleado
  loadEmployeeData(id: string) {
    this.userSrv.getEmployeeById(id).subscribe({
      next: (employee) => {
        // Rellenar los datos en el formulario
        this.form.patchValue({
          rolEmpleado: employee.role,
          nombre: employee.nombre,
          apellido: employee.apellido,
          nombreLogin: employee.nombreLogin,
          dni: employee.dni,
          phoneNumber: employee.phoneNumber,
          email: employee.email,
          activo: employee.activo,  // Seteamos el estado de actividad
          password: '',  // No queremos mostrar la contraseña
          oldPassword: '' // No queremos mostrar la contraseña actual
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

  // Cuando seleccionamos un rol, mostramos los campos adicionales (esto puede modificarse si es necesario)
  onRoleChange() {
    this.showAdditionalFields = true;
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.isEditing) {
        this.updateEmployee();  // Si estamos editando, actualizamos
      } else {
        this.createEmployee();  // Si estamos creando, creamos el empleado
      }
    }
  }

  // Crear un nuevo empleado
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
          this.router.navigate(['/empleados']);  // Redirigir al listado de empleados
        });
      },
      error: (err) => {
        this.errorMsg = 'No se pudo crear el empleado.';
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

  // Actualizar los datos de un empleado
  updateEmployee() {
    const employeeData = { ...this.form.value };

    // Si la contraseña actual está vacía, no la enviamos al backend
    if (!employeeData.oldPassword) {
      delete employeeData.oldPassword;
    }

    // Si la nueva contraseña está vacía, no la enviamos al backend
    if (!employeeData.password) {
      delete employeeData.password;
    }

    // Ahora enviamos los datos (incluyendo la contraseña si fue proporcionada)
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

  // Método para activar o desactivar al empleado
  toggleEmployeeStatus() {
    if (this.form.value.activo) {
      this.markAsInactive();
    } else {
      this.markAsActive();
    }
  }

  // Marcar como inactivo
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

  // Marcar como activo
  markAsActive() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Este empleado será activado nuevamente.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50', // Color verde para activar
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

    goBack(): void {
    this.router.navigate(['/empleados']);
  }

}
