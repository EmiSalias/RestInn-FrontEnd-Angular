import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HabitacionService } from '../../../services/habitacion-service';
import Habitacion from '../../../models/Habitacion';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { H_Tipo } from '../../../models/enums/H_Tipo';

@Component({
  selector: 'app-listado-habitaciones',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './listado-habitaciones.html',
  styleUrl: './listado-habitaciones.css'
})
export class ListadoHabitaciones implements OnInit, OnDestroy {
  private habService = inject(HabitacionService);
  private router = inject(Router);
  private auth = inject(AuthService);

  private subs = new Subscription();

  habitaciones: Habitacion[] = []; 
  habitacionesFiltradas: Habitacion[] = [];

  filtrosVisibles = false;
  filtrosValidos = true;
  loading = false;
  errorMsg = '';

  // Variables de error por campo
  numeroError: string | null = null;
  pisoError: string | null = null;
  capacidadError: string | null = null;
  precioError: string | null = null;
  
  // Flags de permisos
  isCliente = false;
  isAdmin = false;
  isRecepcionista = false;
  isConserje = false;
  isLimpieza = false;
  puedeGestionarHabitaciones = false; // Admin + Empleados

  tiposHabitacion = Object.values(H_Tipo);

  filtros = {
    estado: '',
    capacidadMin: null as number | null,
    capacidadMax: null as number | null,
    precioMin: null as number | null,
    precioMax: null as number | null,
    fechaDesde: '',
    fechaHasta: '',
    filtroActivo: 'activas',
    numero: null as number | null,
    piso: null as number | null,
    tipo: ''
  };

  orden = 'Numero asc';

  ngOnInit(): void {
    const s = this.auth.state$.subscribe(state => {
      const roles = state.roles ?? [];
      const logged = state.isLoggedIn;

      this.isCliente = logged && roles.includes('CLIENTE');
      this.isAdmin = logged && roles.includes('ADMINISTRADOR');
      this.isRecepcionista = logged && roles.includes('RECEPCIONISTA');
      this.isConserje = logged && roles.includes('CONSERJE');
      this.isLimpieza = logged && roles.includes('LIMPIEZA');
      
      this.puedeGestionarHabitaciones = logged && roles.some(r =>
        ['ADMINISTRADOR', 'RECEPCIONISTA', 'CONSERJE', 'LIMPIEZA'].includes(r)
      );

      // SOLO el Admin puede ver 'todas' (inactivas)
      if (this.isAdmin) {
        this.filtros.filtroActivo = 'todas';
      } else {
        this.filtros.filtroActivo = 'activas';
      }

      if (this.habitaciones.length === 0 && !this.loading) {
        this.getHabitaciones();
      }
    });

    this.subs.add(s);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  abrirFiltros() {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  cancelarFiltros() {
    this.filtrosVisibles = false;
  }

  limpiarFiltros() {
    this.filtros = {
      estado: '',
      capacidadMin: null,
      capacidadMax: null,
      precioMin: null,
      precioMax: null,
      fechaDesde: '',
      fechaHasta: '',
      filtroActivo: this.isAdmin ? 'todas' : 'activas', 
      numero: null,
      piso: null,
      tipo: ''
    };
    this.errorMsg = '';
    this.numeroError = null;
    this.pisoError = null;
    this.capacidadError = null;
    this.precioError = null;
    this.habitacionesFiltradas = [...this.habitaciones];
    this.orden = 'Numero asc';
    this.ordenarHabitaciones();
  }

  agregarNueva() {
    this.router.navigate(['/crear_habitacion/form']);
  }

  getHabitaciones() {
    this.loading = true;
    this.errorMsg = '';

    // Solo ADMIN llama a 'listarTodasIncluidasInactivas'.
    // Otros: Trae solo ACTIVAS (el backend filtra el borrado lógico)
    const endpoint$ = this.isAdmin
      ? this.habService.listarTodasIncluidasInactivas() 
      : this.habService.getHabitaciones();

    endpoint$.subscribe({
      next: (data) => {
        if (!this.puedeGestionarHabitaciones) {
           // CLIENTE o PÚBLICO:
           // NO pueden ver: MANTENIMIENTO (ni inactivas, que ya las filtró el backend)
           this.habitaciones = data.filter(h => 
             ['DISPONIBLE', 'OCUPADA', 'LIMPIEZA'].includes(h.estado)
           );
        } else {
           // ADMIN y EMPLEADOS: Ven todo lo que trajo el endpoint
           this.habitaciones = data;
        }
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar habitaciones:', err);
        if (err.status === 403) {
           this.errorMsg = 'No tienes permisos para ver este listado.';
        } else {
           this.errorMsg = 'Error al cargar las habitaciones.';
        }
        this.loading = false;
      }
    });
  }

  // Valida y actualiza los mensajes de error
  validarFiltros(): boolean {
    // Reiniciar todos los errores individuales
    this.numeroError = null;
    this.pisoError = null;
    this.capacidadError = null;
    this.precioError = null;

    const f = this.filtros;
    let esValido = true;

    // Validar Número
    if (f.numero !== null) {
      if (f.numero < 1) {
        this.numeroError = 'Mínimo 1.';
        esValido = false;
      } else if (f.numero > 9999) {
        this.numeroError = 'Máximo 9999.';
        esValido = false;
      }
    }

    // Validar Piso
    if (f.piso !== null) {
      if (f.piso < 1) {
        this.pisoError = 'Mínimo 1.';
        esValido = false;
      } else if (f.piso > 4) {
        this.pisoError = 'Máximo 4.';
        esValido = false;
      }
    }

    // Validar Capacidad
    if (f.capacidadMin !== null && (f.capacidadMin < 1 || f.capacidadMin > 5)) {
      this.capacidadError = 'Debe ser entre 1 y 5.';
      esValido = false;
    } 
    else if (f.capacidadMax !== null && (f.capacidadMax < 1 || f.capacidadMax > 5)) {
      this.capacidadError = 'Debe ser entre 1 y 5.';
      esValido = false;
    }
    else if (f.capacidadMin !== null && f.capacidadMax !== null && f.capacidadMin > f.capacidadMax) {
      this.capacidadError = 'Mínimo mayor que máximo.';
      esValido = false;
    }

    // Validar Precios
    const minPrice = 0.01;
    const maxPrice = 999999999.99;

    if (f.precioMin !== null && (f.precioMin < minPrice || f.precioMin > maxPrice)) {
      this.precioError = 'Mínimo inválido (0.01 - 999M).';
      esValido = false;
    } 
    else if (f.precioMax !== null && (f.precioMax < minPrice || f.precioMax > maxPrice)) {
      this.precioError = 'Máximo inválido (0.01 - 999M).';
      esValido = false;
    }
    else if (f.precioMin !== null && f.precioMax !== null && f.precioMin > f.precioMax) {
      this.precioError = 'Mínimo mayor que máximo.';
      esValido = false;
    }

    this.filtrosValidos = esValido;
    
    return esValido;
  }

  aplicarFiltros() {
    this.loading = true;
    this.errorMsg = '';

    // Llamamos a la validación. Si falla, cortamos aquí.
    if (!this.validarFiltros()) {
      this.loading = false;
      return; 
    }

    // Si NO hay fechas, filtramos en memoria lo que ya tenemos
    const f = this.filtros;
    
    this.habitacionesFiltradas = this.habitaciones.filter(h => {
      // Filtro Activo/Inactivo
      if (f.filtroActivo === 'activas' && !h.activo) return false;
      if (f.filtroActivo === 'inactivas' && h.activo) return false;
      
      // Atributos exactos
      if (f.estado && h.estado !== f.estado) return false;
      if (f.numero != null && h.numero !== f.numero) return false;
      if (f.piso != null && h.piso !== f.piso) return false;
      if (f.tipo && h.tipo !== f.tipo) return false;

      // Rangos numéricos
      if (f.capacidadMin !== null && h.capacidad < f.capacidadMin) return false;
      if (f.capacidadMax !== null && h.capacidad > f.capacidadMax) return false;
      if (f.precioMin !== null && h.precioNoche < f.precioMin) return false;
      if (f.precioMax !== null && h.precioNoche > f.precioMax) return false;
      
      return true;
    });

    this.ordenarHabitaciones();
    this.loading = false;
    this.filtrosVisibles = false;
  }

  ordenarHabitaciones() {
    if (!this.orden) return;
    this.habitacionesFiltradas.sort((a, b) => {
      switch (this.orden) {
        case 'Numero asc': return a.numero - b.numero;
        case 'Numero desc': return b.numero - a.numero;
        case 'Precio asc': return a.precioNoche - b.precioNoche;
        case 'Precio desc': return b.precioNoche - a.precioNoche;
        case 'Capacidad asc': return a.capacidad - b.capacidad;
        case 'Capacidad desc': return b.capacidad - a.capacidad;
        default: return 0;
      }
    });
  }

  getMainImageDataUrl(hab: Habitacion): string | null {
    if (!hab.imagenes || hab.imagenes.length === 0) return null;
    const primera = hab.imagenes[0];
    if (!primera.datosBase64 || !primera.tipo) return null;
    return `data:${primera.tipo};base64,${primera.datosBase64}`;
  }

  reservarHabitacion(hab: Habitacion) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/sign_in'], {
        queryParams: {
          returnUrl: '/crear_reserva/form',
          habitacionId: hab.id,
          capacidad: hab.capacidad
        }
      });
      return;
    }

    const allowed = ['CLIENTE', 'ADMINISTRADOR', 'RECEPCIONISTA'];
    if (!this.auth.hasAnyRole(allowed)) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.router.navigate(['/crear_reserva/form'], {
      queryParams: {
        habitacionId: hab.id,
        capacidad: hab.capacidad
      }
    });
  }

  editHabitacion(hab: Habitacion) {
    this.router.navigate(['/editar_habitacion', hab.id]);
  }

  inhabilitarHabitacion(hab: Habitacion) {
    Swal.fire({
      title: `¿Inhabilitar Habitación ${hab.numero}?`,
      text: 'La habitación se marcará como inactiva y no aparecerá en búsquedas públicas. ¿Continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, inhabilitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habService.inhabilitarHabitacion(hab.id).subscribe({
          next: () => {
            Swal.fire('Inhabilitada', 'La habitación ha sido marcada como inactiva.', 'success');
            this.getHabitaciones();
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'No se pudo inhabilitar.', 'error');
          }
        });
      }
    });
  }

  reactivarHabitacion(hab: Habitacion) {
    Swal.fire({
      title: `¿Reactivar Habitación ${hab.numero}?`,
      text: 'La habitación volverá a estar disponible para búsquedas y reservas.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.habService.reactivarHabitacion(hab.id).subscribe({
          next: () => {
            Swal.fire('Reactivada', 'La habitación está activa nuevamente.', 'success');
            this.getHabitaciones();
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'No se pudo reactivar la habitación.', 'error');
          }
        });
      }
    });
  }

  detailHabitacion(hab: Habitacion) {
    this.router.navigate(['/habitacion', hab.id]);
  }
}