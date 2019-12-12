import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GarageDoorComponent } from './garage-door.component';

describe('GarageDoorComponent', () => {
  let component: GarageDoorComponent;
  let fixture: ComponentFixture<GarageDoorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GarageDoorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GarageDoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
