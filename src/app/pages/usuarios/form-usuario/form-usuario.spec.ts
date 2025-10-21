import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUsuario } from './form-usuario';

describe('FormUsuario', () => {
  let component: FormUsuario;
  let fixture: ComponentFixture<FormUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
