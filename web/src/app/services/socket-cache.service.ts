import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketCacheService {

  endpointsToCache = [
    'devices/garage_door_opener1/clientstatus',
    'devices/garage_door_opener2/clientstatus',
    'devices/outdoor_air_quality/tele/SENSOR',
    'devices/indoor_air_quality/tele/SENSOR',
    'devices/master_bedroom/bed/automation',
    'devices/family_room/fanlight_automation'
  ];
  cache = [];
  constructor(
    private socket: Socket
  ) {
    // listen to all endpoints and put all messages in the cache
    this.endpointsToCache.forEach(endpoint => {
      this.cache[endpoint] = new ReplaySubject(1);
      this.socket.fromEvent(endpoint).subscribe(data => { 
        this.cache[endpoint].next(data);
      });
    });
  }

  fromEvent(endpoint) {
    return this.cache[endpoint];
  }
}
