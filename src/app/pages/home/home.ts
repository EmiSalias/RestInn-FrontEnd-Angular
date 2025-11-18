// src/app/pages/home/home.ts
import {
  Component,
  OnDestroy,
  OnInit,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ListadoHabitaciones } from '../habitaciones/listado-habitaciones/listado-habitaciones';

type HeroKey =
  | 'default'
  | 'reservas'
  | 'habitaciones'
  | 'historial'
  | 'favoritos'
  | 'facturacion'
  | 'adminUsuarios'
  | 'adminHabitaciones'
  | 'adminReservas'
  | 'adminFacturacion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ListadoHabitaciones],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {

  private router = inject(Router);
  private auth = inject(AuthService);

  // si es ADMIN, mostramos el panel premium (getter reactivo)
  get isAdminPanel(): boolean {
    return this.auth.isLoggedIn() && this.auth.hasAnyRole(['ADMINISTRADOR']);
  }

  // --- texto dinámico ---
  heroTextMap: Record<HeroKey, string> = {
    // ===== VISTA PÚBLICO / CLIENTE =====
    default:
      'Pasá el cursor sobre una opción para ver qué podés hacer desde acá.',
    reservas:
      'Realizá una nueva reserva usando el buscador de fechas o revisá las que ya hiciste.',
    habitaciones:
      'Explorá todas las habitaciones, mirá fotos y detalles antes de reservar.',
    historial:
      'Consultá el historial de tus reservas y consumos según tu usuario.',
    favoritos:
      'Próximamente vas a poder guardar tus habitaciones preferidas como favoritas.',
    facturacion:
      'Revisá facturas emitidas y descargá los comprobantes de pago en PDF.',

    // ===== VISTA ADMIN =====
    adminUsuarios:
      'Gestioná altas, bajas y permisos de usuarios y clientes del hotel.',
    adminHabitaciones:
      'Administrá habitaciones, tarifas y estados de disponibilidad.',
    adminReservas:
      'Controlá ingresos, salidas y reservas futuras desde un solo lugar.',
    adminFacturacion:
      'Revisá facturas, cobros pendientes y comprobantes listos para descargar.'
  };

  currentHeroKey: HeroKey = 'default';
  typedHeroText = '';
  private typingIntervalId: any = null;

  // referencia al carrusel SOLO de la vista público/cliente
  @ViewChild('heroCards')
  heroCardsRef?: ElementRef<HTMLDivElement>;

  private heroScrollDir: 'left' | 'right' | null = null;
  private heroScrollId: number | null = null;

  ngOnInit(): void {
    this.startHeroTyping('default');
  }

  ngOnDestroy(): void {
    if (this.typingIntervalId) {
      clearInterval(this.typingIntervalId);
    }
    this.stopHeroScroll();
  }

  // ---------------------------
  // TEXTO TIP "typewriter"
  // ---------------------------
  setHeroText(key: HeroKey): void {
    this.startHeroTyping(key);
  }

  private startHeroTyping(key: HeroKey): void {
    const text = this.heroTextMap[key];
    this.currentHeroKey = key;

    if (!text) return;

    if (this.typingIntervalId) {
      clearInterval(this.typingIntervalId);
      this.typingIntervalId = null;
    }

    this.typedHeroText = '';
    let index = 0;

    this.typingIntervalId = setInterval(() => {
      if (index >= text.length) {
        clearInterval(this.typingIntervalId);
        this.typingIntervalId = null;
        return;
      }

      this.typedHeroText += text.charAt(index);
      index++;
    }, 4);
  }

  // ---------------------------
  // AUTO-SCROLL DE CARDS (solo público/cliente)
  // ---------------------------
  onHeroMouseMove(ev: MouseEvent): void {
    if (window.innerWidth < 720) {
      this.stopHeroScroll();
      return;
    }

    const el = this.heroCardsRef?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const width = rect.width;
    const edgeZone = Math.min(120, width / 4);

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      this.stopHeroScroll();
      return;
    }

    if (x < edgeZone && el.scrollLeft > 0) {
      this.startHeroScroll('left');
    } else if (x > width - edgeZone && el.scrollLeft < maxScroll) {
      this.startHeroScroll('right');
    } else {
      this.stopHeroScroll();
    }
  }

  private startHeroScroll(dir: 'left' | 'right'): void {
    const el = this.heroCardsRef?.nativeElement;
    if (!el) return;

    if (this.heroScrollDir === dir && this.heroScrollId !== null) return;

    this.heroScrollDir = dir;

    if (this.heroScrollId !== null) {
      cancelAnimationFrame(this.heroScrollId);
    }

    const step = 85;

    const tick = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (dir === 'right') {
        el.scrollLeft = Math.min(maxScroll, el.scrollLeft + step);
        if (el.scrollLeft >= maxScroll) {
          this.stopHeroScroll();
          return;
        }
      } else {
        el.scrollLeft = Math.max(0, el.scrollLeft - step);
        if (el.scrollLeft <= 0) {
          this.stopHeroScroll();
          return;
        }
      }

      this.heroScrollId = requestAnimationFrame(tick);
    };

    this.heroScrollId = requestAnimationFrame(tick);
  }

  stopHeroScroll(): void {
    if (this.heroScrollId !== null) {
      cancelAnimationFrame(this.heroScrollId);
      this.heroScrollId = null;
    }
    this.heroScrollDir = null;
  }

  // ---------------------------
  // NAVEGACIÓN PÚBLICO/CLIENTE
  // ---------------------------
  goToReservas(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: { returnUrl: '/crear_reserva' }
      });
      return;
    }

    const allowed = ['CLIENTE', 'ADMINISTRADOR', 'RECEPCIONISTA'];
    if (!this.auth.hasAnyRole(allowed)) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/crear_reserva']);
  }

  goToHistorial(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: { returnUrl: '/mis_reservas' }
      });
      return;
    }

    const esCliente = this.auth.hasAnyRole(['CLIENTE']);
    const target = esCliente
      ? '/mis_reservas'  // Aquí cambiamos la ruta a 'mis_reservas' para el cliente
      : '/reservas/listado';

    this.router.navigate([target]);
  }


  goToHabitaciones(event?: Event): void {
  event?.preventDefault();
  this.router.navigate(['/listado_habitaciones']);
}

  goToFavoritos(event?: Event): void {
    event?.preventDefault();
  }

  goToFacturacion(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: { returnUrl: '/listado_facturas' }
      });
      return;
    }

    const allowed = ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'];
    if (!this.auth.hasAnyRole(allowed)) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/listado_facturas']);
  }

  // ---------------------------
  // NAVEGACIÓN ADMIN DASHBOARD
  // ---------------------------
  goToGestionUsuarios(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.hasAnyRole(['ADMINISTRADOR'])) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/gestion_usuarios']);
  }

  goToAdminHabitaciones(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.hasAnyRole(['ADMINISTRADOR'])) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/listado_habitaciones']);
  }

  goToGestionReservas(event?: Event): void {
    event?.preventDefault();

    const allowed = ['ADMINISTRADOR', 'RECEPCIONISTA'];
    if (!this.auth.hasAnyRole(allowed)) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/gestion_reservas']);
  }
}
