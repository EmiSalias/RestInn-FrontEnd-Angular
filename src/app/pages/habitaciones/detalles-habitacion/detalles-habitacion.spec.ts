import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { DetallesHabitacion }         from './detalles-habitacion';

describe('DetallesHabitacion', () => {
  let component: DetallesHabitacion;
  let fixture: ComponentFixture<DetallesHabitacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesHabitacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesHabitacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
