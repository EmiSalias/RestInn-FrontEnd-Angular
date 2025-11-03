// src/app/components/header/header.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth-service';
import { Observable, map, shareReplay } from 'rxjs';
import { MENU, MenuItem } from '../menu/menu.config';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  faChevronDown = faChevronDown;
  openLabel: string | null = null;

  menu$!: Observable<MenuItem[]>;
  isLoggedIn$!: Observable<boolean>;

  constructor(private auth: AuthService, private router: Router) {
    // inicializar después de tener this.auth
    this.menu$ = this.auth.state$.pipe(
      map(state => filterMenuByRoles(MENU, state)),
      shareReplay(1)
    );
    this.isLoggedIn$ = this.auth.isLoggedIn$;
  }

  toggle(label: string) {
    this.openLabel = this.openLabel === label ? null : label;
  }

  logout() { this.auth.logout(); }
}

/** Helpers */
function canSee(item: MenuItem, roles: string[], isLogged: boolean) {
  if (item.allowedRoles === 'PUBLIC') return true;
  if (!item.allowedRoles) return false;
  if (!isLogged) return false;
  return item.allowedRoles.some((r: string) => roles.includes(r));
}

function materializeLink(item: MenuItem, ctx: { userId?: string | number }) {
  return item.dynamicLink ? item.dynamicLink(ctx) : item.link;
}

function filterMenuByRoles(
  items: MenuItem[],
  state: { roles: string[]; isLoggedIn: boolean; userId?: string | number }
): MenuItem[] {
  const walk = (arr: MenuItem[]): MenuItem[] =>
    arr
      .filter(i => canSee(i, state.roles, state.isLoggedIn))
      .map(i => {
        const children = i.children ? walk(i.children) : undefined;
        const link = materializeLink(i, { userId: state.userId });
        return { ...i, children, link };
      })
      .filter(i => i.link || (i.children && i.children.length));
  return walk(items);
}
