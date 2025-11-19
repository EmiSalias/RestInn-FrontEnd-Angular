import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuConfig } from './menu.config';

describe('MenuConfig', () => {
  let component: MenuConfig;
  let fixture: ComponentFixture<MenuConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
