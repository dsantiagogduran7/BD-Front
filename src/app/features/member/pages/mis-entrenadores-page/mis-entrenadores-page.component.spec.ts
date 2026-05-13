import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisEntrenadoresPageComponent } from './mis-entrenadores-page.component';

describe('MisEntrenadoresPageComponent', () => {
  let component: MisEntrenadoresPageComponent;
  let fixture: ComponentFixture<MisEntrenadoresPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisEntrenadoresPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisEntrenadoresPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
