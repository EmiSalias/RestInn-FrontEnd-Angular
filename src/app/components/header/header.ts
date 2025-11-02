import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faBed, faUtensils, faFileInvoice, faCalendarCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  faHome = faHome;
  faBed = faBed;
  faUtensils = faUtensils;
  faFileInvoice = faFileInvoice;
  faCalendarCheck = faCalendarCheck;
  faChevronDown = faChevronDown;

  openSubmenu: string | null = null;

  toggleSubmenu(menu: string) {
    this.openSubmenu = this.openSubmenu === menu ? null : menu;
  }

    constructor(private auth:AuthService,private router: Router){}
    
    hasRole() {
        return this.auth.isLoggedIn();
    }

    logout(){
      this.auth.logout();
    }

}
