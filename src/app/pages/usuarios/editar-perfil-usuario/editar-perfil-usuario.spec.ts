import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPerfilUsuario } from './editar-perfil-usuario';

describe('EditarPerfilUsuario', () => {
  let component: EditarPerfilUsuario;
  let fixture: ComponentFixture<EditarPerfilUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPerfilUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPerfilUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
