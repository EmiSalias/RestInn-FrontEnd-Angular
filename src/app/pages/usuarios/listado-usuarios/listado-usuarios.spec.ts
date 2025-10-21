import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoUsuarios } from './listado-usuarios';

describe('ListadoUsuarios', () => {
  let component: ListadoUsuarios;
  let fixture: ComponentFixture<ListadoUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
