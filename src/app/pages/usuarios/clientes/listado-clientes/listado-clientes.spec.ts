import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoClientes } from './listado-clientes';

describe('ListadoClientes', () => {
  let component: ListadoClientes;
  let fixture: ComponentFixture<ListadoClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
