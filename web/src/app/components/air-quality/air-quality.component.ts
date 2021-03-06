import { Component, OnInit } from '@angular/core';
import { AirQualityService } from '../../services/air-quality.service';
import aqi from 'aqi-us';
import {interval} from "rxjs/internal/observable/interval";
import {startWith, switchMap} from "rxjs/operators";

@Component({
  selector: 'app-air-quality',
  templateUrl: './air-quality.component.html',
  styleUrls: ['./air-quality.component.scss']
})
export class AirQualityComponent implements OnInit {

  airQuality;
  aqi;
  category;

  constructor(
    private airQualityService: AirQualityService
  ) { }

  ngOnInit() {
    interval(1000 * 60 * 10).pipe( // every 10 mins
      startWith(0),
      switchMap(() => this.airQualityService.get())
    ).subscribe((res : any) => {
      this.airQuality = res;
      this.aqi = aqi.pm25(res.results[0].PM2_5Value);
      if (this.aqi < 50)
        this.category = 'good';
      else if (this.aqi < 100)
        this.category = 'moderate';
      else if (this.aqi < 150)
        this.category = 'unhealthy-sensitive';
      else 
        this.category = 'unhealthy';
    });
  }

}
