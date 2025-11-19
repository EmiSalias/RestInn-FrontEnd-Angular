import { Component, inject }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterLink }             from '@angular/router';
import { FontAwesomeModule }      from '@fortawesome/angular-fontawesome';
import { faUserTie, faUserGear }  from '@fortawesome/free-solid-svg-icons';
import { AuthService }            from '../../../services/auth-service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuarios {
  faUserTie     = faUserTie;
  faUserGear    = faUserGear;
  private auth  = inject(AuthService);

  // Solo ADMINISTRADOR puede ver la card de Empleados
  get canSeeEmpleadosCard(): boolean {
    return this.auth.hasAnyRole(['ADMINISTRADOR']);
  }
}
