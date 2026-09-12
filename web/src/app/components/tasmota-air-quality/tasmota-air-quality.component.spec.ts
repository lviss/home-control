import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasmotaAirQualityComponent } from './tasmota-air-quality.component';

describe('TasmotaAirQualityComponent', () => {
  let component: TasmotaAirQualityComponent;
  let fixture: ComponentFixture<TasmotaAirQualityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasmotaAirQualityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasmotaAirQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
