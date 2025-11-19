import { Component, OnInit, inject }  from '@angular/core';
import { CommonModule }               from '@angular/common';
import { Router }                     from '@angular/router';
import   User                         from '../../../models/User';
import { UserService }                from '../../../services/user-service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css'
})
export class PerfilUsuario implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  user: User | null = null;
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (u) => this.user = u,
      error: () => this.errorMsg = 'No se pudo cargar el perfil'
    });
  }

  editar(): void {
    this.router.navigate(['/editar_perfil']);
  }
}