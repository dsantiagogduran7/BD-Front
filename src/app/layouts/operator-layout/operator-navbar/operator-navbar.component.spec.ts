import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorNavbarComponent } from './operator-navbar.component';

describe('OperatorNavbarComponent', () => {
  let component: OperatorNavbarComponent;
  let fixture: ComponentFixture<OperatorNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
