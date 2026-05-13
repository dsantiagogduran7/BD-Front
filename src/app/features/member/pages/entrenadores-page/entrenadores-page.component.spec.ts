import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenadoresPageComponent } from './entrenadores-page.component';

describe('EntrenadoresPageComponent', () => {
  let component: EntrenadoresPageComponent;
  let fixture: ComponentFixture<EntrenadoresPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenadoresPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrenadoresPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
