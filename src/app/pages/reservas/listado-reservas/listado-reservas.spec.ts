import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoReservas } from './listado-reservas';

describe('ListadoReservas', () => {
  let component: ListadoReservas;
  let fixture: ComponentFixture<ListadoReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoReservas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
