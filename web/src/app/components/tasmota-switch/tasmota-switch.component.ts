import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-tasmota-switch',
  templateUrl: './tasmota-switch.component.html',
  styleUrls: ['./tasmota-switch.component.scss']
})
export class TasmotaSwitchComponent implements OnInit {

  @Input() deviceName: string;

  state$;
  topic: string;

  constructor(private socket: Socket) { }

  ngOnInit() {
    this.topic = 'devices/' + this.deviceName + '/stat/POWER';
    this.state$ = this.socket.fromEvent(this.topic);
  }

  onChange(event) {
    this.socket.emit('devices/' + this.deviceName + '/cmnd/Power1', 'TOGGLE'); 
  }
}
