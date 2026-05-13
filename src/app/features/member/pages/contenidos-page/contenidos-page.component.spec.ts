import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidosPageComponent } from './contenidos-page.component';

describe('ContenidosPageComponent', () => {
  let component: ContenidosPageComponent;
  let fixture: ComponentFixture<ContenidosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenidosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
