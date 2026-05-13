import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaquinasPageComponent } from './maquinas-page.component';

describe('MaquinasPageComponent', () => {
  let component: MaquinasPageComponent;
  let fixture: ComponentFixture<MaquinasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaquinasPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaquinasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
