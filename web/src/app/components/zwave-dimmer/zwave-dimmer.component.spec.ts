import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZwaveDimmerComponent } from './zwave-dimmer.component';

describe('ZwaveDimmerComponent', () => {
  let component: ZwaveDimmerComponent;
  let fixture: ComponentFixture<ZwaveDimmerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZwaveDimmerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZwaveDimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
