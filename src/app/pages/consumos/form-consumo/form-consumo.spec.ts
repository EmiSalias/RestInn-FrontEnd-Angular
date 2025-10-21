import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConsumo } from './form-consumo';

describe('FormConsumo', () => {
  let component: FormConsumo;
  let fixture: ComponentFixture<FormConsumo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormConsumo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormConsumo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
