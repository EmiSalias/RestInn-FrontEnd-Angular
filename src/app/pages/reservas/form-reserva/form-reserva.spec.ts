import { ComponentFixture, TestBed }  from '@angular/core/testing';
import { FormReserva }                from './form-reserva';

describe('FormReserva', () => {
  let component: FormReserva;
  let fixture: ComponentFixture<FormReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormReserva]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormReserva);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
