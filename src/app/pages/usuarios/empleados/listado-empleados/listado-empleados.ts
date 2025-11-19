import { Component, OnInit, inject }  from '@angular/core';
import { CommonModule }               from '@angular/common';
import { RouterLink }                 from '@angular/router';
import { UserService }                from '../../../../services/user-service';
import   User                         from '../../../../models/User';

@Component({
  selector: 'app-listado-empleados',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listado-empleados.html',
  styleUrls: ['./listado-empleados.css']
})
export class ListadoEmpleados implements OnInit {
  private userSrv = inject(UserService);

  empleados:          User[]    = [];
  empleadosActivos:   User[]    = [];
  empleadosInactivos: User[]    = [];
  loading                       = false;
  errorMsg: string | null       = null;
  sortField:    keyof User      = 'nombre'; // keyof User para que el campo esté limitado a las claves de User
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.loading = true;
    this.errorMsg = null;

    this.userSrv.getAllEmpleados().subscribe({
      next: (users) => {
        this.empleados = users;
        this.empleadosActivos = this.empleados.filter(u => u.activo);
        this.empleadosInactivos = this.empleados.filter(u => !u.activo);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando empleados', err);
        this.errorMsg = 'No se pudieron cargar los empleados.';
        this.loading = false;
      }
    });
  }

  // Filtrar empleados según su estado (activo/inactivo)
  filtrarEmpleados(estado: boolean): void {
    if (estado) {
      this.empleados = this.empleadosActivos;
    } else {
      this.empleados = this.empleadosInactivos;
    }
  }

  // Método de ordenamiento
  onSort(field: keyof User): void { // keyof User
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    // Ordenamos la lista de empleados
    this.empleados.sort((a, b) => {
      const valueA = a[field] as string | number;
      const valueB = b[field] as string | number;

      let compare = 0;
      if (valueA < valueB) {
        compare = -1;
      } else if (valueA > valueB) {
        compare = 1;
      }
      
      return this.sortDirection === 'asc' ? compare : -compare;
    });
  }
}
