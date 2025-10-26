import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faBed, faUtensils, faFileInvoice, faCalendarCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

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
}
