import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { ListadoConsumos }            from './listado-consumos';

describe('ListadoConsumos', () => {
  let component: ListadoConsumos;
  let fixture: ComponentFixture<ListadoConsumos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoConsumos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoConsumos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
