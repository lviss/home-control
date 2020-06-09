import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  styleUrls: ['./tv.component.scss']
})
export class TvComponent implements OnInit {

  @Input() deviceName: string;
  deviceTopic: string;
  commandTopic: string;
  powerState$;
  volumeState$;
  inputState$;
  constructor(private socket: Socket) { }

  ngOnInit() {
    this.deviceTopic = 'devices/' + this.deviceName;
    this.commandTopic = 'devices/' + this.deviceName + '/command';
    this.powerState$ = this.socket.fromEvent(this.deviceTopic + '/power');
    this.inputState$ = this.socket.fromEvent(this.deviceTopic + '/input');
    this.volumeState$ = this.socket.fromEvent(this.deviceTopic + '/volume')
      .pipe(map( (data:string) => parseInt(data) ));
  }

  setVolume(newVolume) {
    this.socket.emit(this.commandTopic + '/volume', newVolume); 
  }
  power(value) {
    this.socket.emit(this.commandTopic + '/power', value); 
  }
  setInput(input) {
    this.socket.emit(this.commandTopic + '/input', input); 
  }
}
