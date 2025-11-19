import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faListUl, faPlus, faBed } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-gestion-habitaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './gestion-habitaciones.html',
  styleUrls: ['./gestion-habitaciones.css']
})
export class GestionHabitaciones {
  faList = faListUl;
  faPlus = faPlus;
  faBed = faBed;

  private auth = inject(AuthService);

  // Solo ADMIN puede crear nuevas habitaciones
  get canCreateRoom(): boolean {
    return this.auth.hasAnyRole(['ADMINISTRADOR']);
  }
}
