import { Component, OnInit, Input } from '@angular/core';
// import { TasmotaSensorService } from '../../services/tasmota-sensor.service';
import { SocketCacheService } from '../../services/socket-cache.service';

@Component({
  selector: 'app-tasmota-air-quality',
  templateUrl: './tasmota-air-quality.component.html',
  styleUrls: ['./tasmota-air-quality.component.scss']
})
export class TasmotaAirQualityComponent implements OnInit {

  @Input() deviceName: string;

  state$;

  constructor(
    // private tasmotaSensorService: TasmotaSensorService,
    private socketCache: SocketCacheService
  ) { }

  ngOnInit() {
    const topic = 'devices/' + this.deviceName + '/tele/SENSOR';
    this.state$ = this.socketCache.fromEvent(topic);
    // this.state$ = this.tasmotaSensorService.fromDevice(this.deviceName);
  }

  objectify(data) {
    return JSON.parse(data);
  }

  dateAgo(value) {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29) { // less than 30 seconds ago will show as 'Just now'
        return 'Just now';
      }
      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        min: 60,
        // 'minute': 60,
        sec: 1
        // 'second': 1
      };
      let counter;
      for (const i in intervals) {
        if (intervals.hasOwnProperty(i)) {
          counter = Math.floor(seconds / intervals[i]);
          if (counter > 0) {
            if (counter === 1) {
              return counter + ' ' + i + ' ago'; // singular (1 day ago)
            } else {
              return counter + ' ' + i + 's ago'; // plural (2 days ago)
            }
          }
        }
      }
    }
    return value;
  }

  qualityCategory(value) {
    if (value < 50) {
      return 'good';
    } else if (value < 100) {
      return 'moderate';
    } else if (value < 150) {
      return 'unhealthy-sensitive';
    } else {
      return 'unhealthy';
    }
  }
}
