import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPolicy } from './cancel-policy';

describe('CancelPolicy', () => {
  let component: CancelPolicy;
  let fixture: ComponentFixture<CancelPolicy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelPolicy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelPolicy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
