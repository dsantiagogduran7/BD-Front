import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasesPageComponent } from './clases-page.component';

describe('ClasesPageComponent', () => {
  let component: ClasesPageComponent;
  let fixture: ComponentFixture<ClasesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClasesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
