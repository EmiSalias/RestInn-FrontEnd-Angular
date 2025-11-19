import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { ListadoFacturas }            from './listado-facturas';

describe('ListadoFacturas', () => {
  let component: ListadoFacturas;
  let fixture: ComponentFixture<ListadoFacturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoFacturas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoFacturas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
