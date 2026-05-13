import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberNavbarComponent } from './member-navbar.component';

describe('MemberNavbarComponent', () => {
  let component: MemberNavbarComponent;
  let fixture: ComponentFixture<MemberNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
