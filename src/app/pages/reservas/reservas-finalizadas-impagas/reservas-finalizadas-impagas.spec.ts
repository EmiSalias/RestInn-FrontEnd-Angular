import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasFinalizadasImpagas } from './reservas-finalizadas-impagas';

describe('ReservasFinalizadasImpagas', () => {
  let component: ReservasFinalizadasImpagas;
  let fixture: ComponentFixture<ReservasFinalizadasImpagas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasFinalizadasImpagas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasFinalizadasImpagas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
