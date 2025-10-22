import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditions } from './terms-conditions';

describe('TermsConditions', () => {
  let component: TermsConditions;
  let fixture: ComponentFixture<TermsConditions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsConditions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsConditions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
