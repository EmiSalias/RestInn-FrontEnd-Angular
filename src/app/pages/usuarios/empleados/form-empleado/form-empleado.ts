import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user-service';
import { RolEmpleado } from '../../../../models/enums/E_Rol';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-creacion-empleado',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './form-empleado.html',
  styleUrls: ['./form-empleado.css']
})
export class FormEmpleado {
  form: FormGroup;
  roles = Object.values(RolEmpleado);
  errorMsg: string | null = null;
  showAdditionalFields = false; // Variable para mostrar los campos adicionales

  constructor(private fb: FormBuilder, private userSrv: UserService, private router: Router) {
    this.form = this.fb.group({
      rolEmpleado: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      nombreLogin: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Cuando seleccionamos un rol, mostramos los campos adicionales
  onRoleChange() {
    this.showAdditionalFields = true;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.userSrv.createEmployee(this.form.value).subscribe({
        next: (user) => {
          Swal.fire({
            icon: 'success',
            title: 'Empleado creado con éxito',
            text: `El empleado ${user.nombre} ha sido creado correctamente.`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#f1c36f'
          }).then(() => {
            // Redirigir al listado de empleados después de la confirmación
            this.router.navigate(['/empleados']);
          });
        },
        error: (err) => {
          console.error('Error creando empleado', err);
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
  }
}
