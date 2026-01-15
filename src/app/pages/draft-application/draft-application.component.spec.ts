import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftApplicationComponent } from './draft-application.component';

describe('DraftApplicationComponent', () => {
  let component: DraftApplicationComponent;
  let fixture: ComponentFixture<DraftApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
