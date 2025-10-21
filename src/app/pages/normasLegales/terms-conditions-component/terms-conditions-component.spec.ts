import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditionsComponent } from './terms-conditions-component';

describe('TermsConditionsComponent', () => {
  let component: TermsConditionsComponent;
  let fixture: ComponentFixture<TermsConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
