import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { GestionHabitaciones }        from './gestion-habitaciones';

describe('GestionHabitaciones', () => {
  let component: GestionHabitaciones;
  let fixture: ComponentFixture<GestionHabitaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionHabitaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionHabitaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
