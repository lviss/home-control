import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AirQualityService {

  constructor(
    private http: HttpClient,
  ) {}

  get() {
    return this.http.get('https://www.purpleair.com/json?show=17513')
  }
}
