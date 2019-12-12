import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasmotaSwitchComponent } from './tasmota-switch.component';

describe('TasmotaSwitchComponent', () => {
  let component: TasmotaSwitchComponent;
  let fixture: ComponentFixture<TasmotaSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasmotaSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasmotaSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
