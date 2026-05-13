import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiembrosPageComponent } from './miembros-page.component';

describe('MiembrosPageComponent', () => {
  let component: MiembrosPageComponent;
  let fixture: ComponentFixture<MiembrosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiembrosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiembrosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
