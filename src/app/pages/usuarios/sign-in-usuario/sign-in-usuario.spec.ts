import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInUsuario } from './sign-in-usuario';

describe('SignInUsuario', () => {
  let component: SignInUsuario;
  let fixture: ComponentFixture<SignInUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
