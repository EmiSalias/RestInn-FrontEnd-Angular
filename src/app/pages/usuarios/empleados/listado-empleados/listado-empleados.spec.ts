import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoEmpleados } from './listado-empleados';

describe('ListadoEmpleados', () => {
  let component: ListadoEmpleados;
  let fixture: ComponentFixture<ListadoEmpleados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoEmpleados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoEmpleados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
