import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisAlumnosPageComponent } from './mis-alumnos-page.component';

describe('MisAlumnosPageComponent', () => {
  let component: MisAlumnosPageComponent;
  let fixture: ComponentFixture<MisAlumnosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisAlumnosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisAlumnosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
