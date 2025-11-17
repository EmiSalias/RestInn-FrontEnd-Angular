import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay', () => {
  let component: LoadingOverlay;
  let fixture: ComponentFixture<LoadingOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
