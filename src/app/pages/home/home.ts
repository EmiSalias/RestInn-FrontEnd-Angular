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

type HeroKey = 'default' | 'reservas' | 'habitaciones' | 'historial' | 'favoritos';

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

  // --- texto dinámico ---
  heroTextMap: Record<HeroKey, string> = {
    default: 'Pasá el cursor sobre una opción para ver qué podés hacer desde acá.',
    reservas: 'Realizá una nueva reserva usando el buscador de fechas o revisá las que ya hiciste.',
    habitaciones: 'Explorá todas las habitaciones, mirá fotos y detalles antes de reservar.',
    historial: 'Consultá el historial de tus reservas y consumos según tu usuario.',
    favoritos: 'Próximamente vas a poder guardar tus habitaciones preferidas como favoritas.'
  };

  currentHeroKey: HeroKey = 'default';
  typedHeroText = '';
  private typingIntervalId: any = null;

  // --- referencia al contenedor de cards ---
  @ViewChild('heroCards', { static: true })
  heroCardsRef?: ElementRef<HTMLDivElement>;

  // --- estado de auto-scroll ---
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
  // AUTO-SCROLL DE CARDS
  // ---------------------------

  onHeroMouseMove(ev: MouseEvent): void {
    // en mobile no hacemos nada
    if (window.innerWidth < 720) {
      this.stopHeroScroll();
      return;
    }

    const el = this.heroCardsRef?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const width = rect.width;
    const edgeZone = Math.min(120, width / 4); // zona sensible

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

    const step = 22; // velocidad de desplazamiento (px por frame)

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
  // NAVEGACIÓN DE CARDS
  // ---------------------------

  goToReservas(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: { returnUrl: '/crear_reserva/form' }
      });
      return;
    }

    const allowed = ['CLIENTE', 'ADMINISTRADOR', 'RECEPCIONISTA'];
    if (!this.auth.hasAnyRole(allowed)) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/crear_reserva/form']);
  }

  goToHistorial(event?: Event): void {
    event?.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: { returnUrl: '/reservas/historial' }
      });
      return;
    }

    const esCliente = this.auth.hasAnyRole(['CLIENTE']);
    const target = esCliente
      ? '/reservas_cliente/listado'
      : '/reservas/listado';

    this.router.navigate([target]);
  }

  goToHabitaciones(event?: Event): void {
    event?.preventDefault();
    const section = document.getElementById('habitaciones-home');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goToFavoritos(event?: Event): void {
    event?.preventDefault();
    // placeholder por ahora
    // this.router.navigate(['/favoritos']);
  }
}
