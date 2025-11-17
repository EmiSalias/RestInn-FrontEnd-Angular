import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faListUl, faPlus, faBed } from '@fortawesome/free-solid-svg-icons';

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
}
