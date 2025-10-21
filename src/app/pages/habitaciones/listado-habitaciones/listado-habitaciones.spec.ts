import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoHabitaciones } from './listado-habitaciones';

describe('ListadoHabitaciones', () => {
  let component: ListadoHabitaciones;
  let fixture: ComponentFixture<ListadoHabitaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoHabitaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoHabitaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
