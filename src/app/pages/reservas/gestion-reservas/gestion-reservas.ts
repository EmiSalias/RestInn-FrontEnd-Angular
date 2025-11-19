import { Component }                    from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { RouterLink }                   from '@angular/router';
import { FontAwesomeModule }            from '@fortawesome/angular-fontawesome';
import { faListUl, faPlus, faDoorOpen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-gestion-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './gestion-reservas.html',
  styleUrl: './gestion-reservas.css'
})
export class GestionReservas {
  faList = faListUl;
  faPlus = faPlus;
  faDoorOpen = faDoorOpen;
}
