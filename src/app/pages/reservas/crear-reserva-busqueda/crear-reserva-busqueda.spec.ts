import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearReservaBusqueda } from './crear-reserva-busqueda';

describe('CrearReservaBusqueda', () => {
  let component: CrearReservaBusqueda;
  let fixture: ComponentFixture<CrearReservaBusqueda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearReservaBusqueda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearReservaBusqueda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
