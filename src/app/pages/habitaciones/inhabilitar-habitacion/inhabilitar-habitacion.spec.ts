import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InhabilitarHabitacion } from './inhabilitar-habitacion';

describe('InhabilitarHabitacion', () => {
  let component: InhabilitarHabitacion;
  let fixture: ComponentFixture<InhabilitarHabitacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InhabilitarHabitacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InhabilitarHabitacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
