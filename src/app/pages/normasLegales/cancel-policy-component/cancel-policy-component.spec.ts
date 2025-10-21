import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPolicyComponent } from './cancel-policy-component';

describe('CancelPolicyComponent', () => {
  let component: CancelPolicyComponent;
  let fixture: ComponentFixture<CancelPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
