import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesUsuario } from './detalles-usuario';

describe('DetallesUsuario', () => {
  let component: DetallesUsuario;
  let fixture: ComponentFixture<DetallesUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
