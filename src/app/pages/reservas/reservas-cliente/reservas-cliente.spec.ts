import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasCliente } from './reservas-cliente';

describe('ReservasCliente', () => {
  let component: ReservasCliente;
  let fixture: ComponentFixture<ReservasCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
