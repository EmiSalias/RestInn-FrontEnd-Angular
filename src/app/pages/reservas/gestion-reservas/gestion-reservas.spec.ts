import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionReservas } from './gestion-reservas';

describe('GestionReservas', () => {
  let component: GestionReservas;
  let fixture: ComponentFixture<GestionReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionReservas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
