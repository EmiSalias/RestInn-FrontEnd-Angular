import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css'
})
export class Unauthorized {}
