import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { FacturaReserva }             from './factura-reserva';

describe('FacturaReserva', () => {
  let component: FacturaReserva;
  let fixture: ComponentFixture<FacturaReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturaReserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturaReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
