import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCliente } from './form-cliente';

describe('FormCliente', () => {
  let component: FormCliente;
  let fixture: ComponentFixture<FormCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
