import { TestBed } from '@angular/core/testing';
import { HabitacionesService } from './habitaciones.service';


describe('HabitacionesServices', () => {
  let service: HabitacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabitacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
