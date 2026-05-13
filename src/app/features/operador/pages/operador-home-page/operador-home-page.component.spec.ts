import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperadorHomePageComponent } from './operador-home-page.component';

describe('OperadorHomePageComponent', () => {
  let component: OperadorHomePageComponent;
  let fixture: ComponentFixture<OperadorHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperadorHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperadorHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
