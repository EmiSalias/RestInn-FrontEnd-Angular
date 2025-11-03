import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recovery } from './recovery';

describe('Recovery', () => {
  let component: Recovery;
  let fixture: ComponentFixture<Recovery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recovery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recovery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
