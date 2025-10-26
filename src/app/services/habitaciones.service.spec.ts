import { TestBed } from '@angular/core/testing';

import { HabitacionesServices } from './habitaciones.services';

describe('HabitacionesServices', () => {
  let service: HabitacionesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitacionesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
