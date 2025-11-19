import { CommonModule }                       from '@angular/common';
import { Component, OnInit, inject }          from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService }                        from '../../../services/auth-service';
import { UserService }                        from '../../../services/user-service';
import   User                                 from '../../../models/User';

@Component({
  selector: 'app-detalles-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalles-usuario.html',
  styleUrls: ['./detalles-usuario.css'],
})
export class DetallesUsuario implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private auth        = inject(AuthService);
  private userService = inject(UserService);

  user?: User;
  loading                 = false;
  errorMsg: string | null = null;

  constructor() {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.errorMsg = 'Usuario no encontrado';
      return;
    }

    this.loading = true;
    this.userService.getById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar los datos del usuario.';
        this.loading = false;
      },
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  goBack() {
    this.router.navigate(['/listado_clientes']);
  }
}
