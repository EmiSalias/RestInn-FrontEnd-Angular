import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpUsuario } from './sign-up-usuario';

describe('SignUpUsuario', () => {
  let component: SignUpUsuario;
  let fixture: ComponentFixture<SignUpUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
