import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-form-usuario',
  imports: [],
  templateUrl: './form-usuario.html',
  styleUrl: './form-usuario.css'
})
export class FormUsuario {
  constructor(private auth:AuthService){}
  
  hasRole() {
      return this.auth.isLoggedIn();
  }
}
