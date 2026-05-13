import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembresiasPageComponent } from './membresias-page.component';

describe('MembresiasPageComponent', () => {
  let component: MembresiasPageComponent;
  let fixture: ComponentFixture<MembresiasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembresiasPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembresiasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
