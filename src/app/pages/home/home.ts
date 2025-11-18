// src/app/pages/home/home.ts
import {
  Component,
  OnDestroy,
  OnInit,
  HostListener,
  ViewChildren,
  ElementRef,
  QueryList,
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

interface HeroSection {
  key: HeroKey;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
}

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

  // ===== BLOQUES DEL HERO PÚBLICO (SCROLL VERTICAL) =====
  publicHeroSections: HeroSection[] = [
    {
      key: 'reservas',
      tag: '📅 Reservar',
      title: 'Reservá en las fechas que quieras',
      description: 'Buscá disponibilidad por fecha de ingreso y salida, elegí la habitación ideal y confirmá tu reserva en pocos pasos.',
      imageUrl: 'assets/restinn/hero-reservas.jpg'
    },
    {
      key: 'habitaciones',
      tag: '🛏️ Habitaciones',
      title: 'Explorá las habitaciones del hotel',
      description: 'Vas a poder ver fotos, servicios incluidos y capacidad de cada habitación antes de decidirte.',
      imageUrl: 'assets/restinn/hero-servicios.jpg'
    },
    {
      key: 'historial',
      tag: '📊 Historial',
      title: 'Revisá tu historial de reservas',
      description: 'Consultá reservas pasadas, próximas estadías y el detalle de cada una asociada a tu usuario.',
      imageUrl: 'assets/restinn/hero-historial.jpg'
    },
    {
      key: 'facturacion',
      tag: '💳 Facturación & pagos',
      title: 'Accedé a tus facturas y comprobantes',
      description: 'Descargá los comprobantes en PDF, revisá estados de pago y mantené tu facturación al día.',
      imageUrl: 'assets/restinn/hero-facturacion.jpg'
    }
  ];

  // referencias a los bloques para calcular cuál está “en foco”
  @ViewChildren('heroStep')
  heroStepRefs?: QueryList<ElementRef<HTMLDivElement>>;

  activeHeroIndex = 0;

  // --- texto dinámico ---
  heroTextMap: Record<HeroKey, string> = {
    // ===== VISTA PÚBLICO / CLIENTE =====
    default:
      'Pasá el cursor o scrolleá para ver qué podés hacer desde acá.',
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

  ngOnInit(): void {
    this.startHeroTyping('default');
  }

  ngOnDestroy(): void {
    if (this.typingIntervalId) {
      clearInterval(this.typingIntervalId);
    }
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
  // SCROLL VERTICAL – detectar bloque activo
  // ---------------------------
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // si es admin o no hay bloques, salimos
    if (this.isAdminPanel) return;

    const steps = this.heroStepRefs;
    if (!steps || steps.length === 0) return;

    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;

    steps.forEach((step, index) => {
      const rect = step.nativeElement.getBoundingClientRect();
      const stepCenter = rect.top + rect.height / 2;
      const distance = Math.abs(stepCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== this.activeHeroIndex) {
      this.activeHeroIndex = closestIndex;
      const section = this.publicHeroSections[closestIndex];
      this.startHeroTyping(section.key);
    }
  }

  // click en un bloque del hero (público/cliente)
  onHeroSectionClick(key: HeroKey, event?: Event): void {
    event?.preventDefault();

    switch (key) {
      case 'reservas':
        this.goToReservas(event);
        break;
      case 'habitaciones':
        this.goToHabitaciones(event);
        break;
      case 'historial':
        this.goToHistorial(event);
        break;
      case 'facturacion':
        this.goToFacturacion(event);
        break;
      default:
        break;
    }
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
    const target = esCliente ? '/mis_reservas' : '/reservas/listado';

    this.router.navigate([target]);
  }

  goToHabitaciones(event?: Event): void {
    event?.preventDefault();
    this.router.navigate(['/listado_habitaciones']);
  }

  goToFavoritos(event?: Event): void {
    event?.preventDefault();
    // feature futura
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
