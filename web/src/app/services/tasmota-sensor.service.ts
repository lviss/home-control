import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class TasmotaSensorService {

  constructor(
    private socket: Socket
  ) {
  }

  fromDevice(deviceName) {
    const topic = 'devices/' + deviceName + '/tele/SENSOR';
    return this.socket.fromEvent(topic);
  }
}
