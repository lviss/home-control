import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-zwave-dimmer',
  templateUrl: './zwave-dimmer.component.html',
  styleUrls: ['./zwave-dimmer.component.scss']
})
export class ZwaveDimmerComponent implements OnInit {

  @Input() deviceName: string;
  state$;
  topic: string;

  constructor(private socket: Socket) { }

  ngOnInit() {
    this.topic = 'devices/' + this.deviceName + '/level'
    this.state$ = this.socket.fromEvent(this.topic);
  }

  onSlide(event) {
    this.socket.emit(this.topic + '/set', event.value); 
  }
}
