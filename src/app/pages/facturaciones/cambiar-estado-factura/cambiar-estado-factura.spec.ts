import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { CambiarEstadoFactura }       from './cambiar-estado-factura';

describe('CambiarEstadoFactura', () => {
  let component: CambiarEstadoFactura;
  let fixture: ComponentFixture<CambiarEstadoFactura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarEstadoFactura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarEstadoFactura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
