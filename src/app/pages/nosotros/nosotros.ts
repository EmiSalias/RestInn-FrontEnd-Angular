import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css'
})
export class Nosotros {
  
  // Nombres de los integrantes
  equipo = [
    { 
      nombre: 'Emiliano Salias', 
      avatar: 'ES', 
      linkdinUrl: 'https://www.linkedin.com/in/emiliano-salias/'
    },
    { 
      nombre: 'Manuel Sosa', 
      avatar: 'MS', 
      linkdinUrl: 'https://www.linkedin.com/in/manuel-sosa-jurado/'
    },
    { 
      nombre: 'Guido Devoto', 
      avatar: 'GD', 
      linkdinUrl: 'https://www.linkedin.com/in/guido-devoto/'
    },
    { 
      nombre: 'Joaquin Macias', 
      avatar: 'JM', 
      linkdinUrl: 'https://www.linkedin.com/in/joaquin-macias-654332134/'
    }
  ];
}
