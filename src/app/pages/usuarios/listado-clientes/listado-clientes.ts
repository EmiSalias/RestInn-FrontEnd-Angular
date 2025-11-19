import { Component, OnInit, inject }  from '@angular/core';
import { CommonModule }               from '@angular/common';
import { RouterLink }                 from '@angular/router';
import { UserService }                from '../../../services/user-service';
import   User                         from '../../../models/User';

@Component({
  selector: 'app-listado-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listado-clientes.html',
  styleUrl: './listado-clientes.css'
})
export class ListadoClientes implements OnInit {
  private userSrv = inject(UserService);

  clientes: User[]        = [];
  loading                 = false;
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.errorMsg = null;

    this.userSrv.getAll().subscribe({
      next: (users) => {
        this.clientes = users.filter(u => u.role === 'CLIENTE');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
        this.errorMsg = 'No se pudieron cargar los clientes.';
        this.loading = false;
      }
    });
  }
}
