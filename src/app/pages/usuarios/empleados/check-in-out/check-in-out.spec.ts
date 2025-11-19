import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInOut } from './check-in-out';

describe('CheckInOut', () => {
  let component: CheckInOut;
  let fixture: ComponentFixture<CheckInOut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInOut]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInOut);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
