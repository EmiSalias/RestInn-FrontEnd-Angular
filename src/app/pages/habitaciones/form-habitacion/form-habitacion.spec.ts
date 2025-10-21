import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHabitacion } from './form-habitacion';

describe('FormHabitacion', () => {
  let component: FormHabitacion;
  let fixture: ComponentFixture<FormHabitacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHabitacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormHabitacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
