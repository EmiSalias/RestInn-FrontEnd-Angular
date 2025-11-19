import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core'; 
import { Router, RouterLink }                                     from '@angular/router';
import { CommonModule }                                           from '@angular/common';
import { FontAwesomeModule }                                      from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faUser,
  faUserTie,
  faUserSecret,
  faUserGear,
  faMoon,
  faSun,
  faBroom,
  faKey,
  faConciergeBell
}                                                                 from '@fortawesome/free-solid-svg-icons';
import { AuthService }                                            from '../../services/auth-service';
import { Observable, map, shareReplay, switchMap, of }            from 'rxjs';
import { MENU, MenuItem }                                         from '../menu/menu.config';
import { UserService }                                            from '../../services/user-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  faChevronDown = faChevronDown;
  faUser = faUser;
  faMoon = faMoon;
  faSun = faSun;

  private readonly iconAdmin = faUserSecret;
  private readonly iconClient = faUserTie;
  private readonly iconEmployee = faUserGear;

  private readonly iconReceptionist = faConciergeBell;
  private readonly iconConserje = faKey;
  private readonly iconLimpieza = faBroom;

  @ViewChild('menuInput') menuInput?: ElementRef<HTMLInputElement>;
  @ViewChild('userMenu') userMenuRef?: ElementRef<HTMLDivElement>;

  openLabel: string | null = null;
  userMenuOpen = false;

  isDarkTheme = true;

  menu$!: Observable<MenuItem[]>;
  isLoggedIn$!: Observable<boolean>;
  userInfo$!: Observable<{ displayName: string; roleRaw: string } | null>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.menu$ = this.auth.state$.pipe(
      map(state => filterMenuByRoles(MENU, state)),
      shareReplay(1)
    );

    this.isLoggedIn$ = this.auth.isLoggedIn$;

    this.userInfo$ = this.auth.state$.pipe(
      switchMap(state => {
        if (!state.isLoggedIn) return of(null);

        return this.userService.getCurrentUser().pipe(
          map(user => {
            const displayName =
              [user.nombre, user.apellido].filter(Boolean).join(' ') ||
              user.nombreLogin ||
              user.email ||
              'Usuario';

            const raw = (state.roles?.[0] || '').replace(/^ROLE_/, '').toUpperCase();

            return { displayName, roleRaw: raw };
          })
        );
      }),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('theme');
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme: 'dark' | 'light' =
      stored === 'dark' || stored === 'light'
        ? (stored as 'dark' | 'light')
        : (prefersDark ? 'dark' : 'light');

    this.applyTheme(theme);
  }

  toggleTheme() {
    const next: 'dark' | 'light' = this.isDarkTheme ? 'light' : 'dark';
    this.applyTheme(next);
  }

  private applyTheme(theme: 'dark' | 'light') {
    this.isDarkTheme = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggle(label: string) {
    this.openLabel = this.openLabel === label ? null : label;
  }

  onMenuItemClick() {
    this.closeSideMenu();
    this.closeUserMenu();
  }

  private closeSideMenu() {
    if (this.menuInput?.nativeElement.checked) {
      this.menuInput.nativeElement.checked = false;
      this.openLabel = null;
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  openUserMenu() {
    this.userMenuOpen = true;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.userMenuOpen) return;

    const target = event.target as HTMLElement | null;
    const menuEl = this.userMenuRef?.nativeElement;

    if (menuEl && target && !menuEl.contains(target)) {
      this.closeUserMenu();
    }
  }

  logout() {
    this.auth.logout();
    this.closeUserMenu();
  }

  getRoleIcon(roleRaw: string | null | undefined) {
    const r = (roleRaw || '').toUpperCase();

    // ADMINISTRADOR
    if (r === 'ADMIN' || r === 'ADMINISTRADOR') return this.iconAdmin;

    // EMPLEADOS ESPECÍFICOS
    if (r === 'RECEPCIONISTA') return this.iconReceptionist;
    if (r === 'CONSERJE') return this.iconConserje;
    if (r === 'LIMPIEZA') return this.iconLimpieza;

    // EMPLEADO genérico
    if (r === 'EMPLEADO') return this.iconEmployee;

    // CLIENTE
    if (r === 'CLIENTE' || r === 'USER') return this.iconClient;

    // fallback
    return this.faUser;
  }
}

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
