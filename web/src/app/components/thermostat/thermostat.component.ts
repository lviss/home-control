import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-thermostat',
  templateUrl: './thermostat.component.html',
  styleUrls: ['./thermostat.component.scss']
})
export class ThermostatComponent implements OnInit {

  @Input() deviceName: string;
  deviceTopic: string;
  state$;
  constructor(private socket: Socket) { }

  ngOnInit() {
    this.deviceTopic = 'devices/' + this.deviceName;
    this.state$ = this.socket.fromEvent(this.deviceTopic + '/get')
      .pipe(map( (data:string) => JSON.parse(data) ));
  }

  dec() {
    this.socket.emit(this.deviceTopic + '/desired_temperature/dec'); 
  }
  inc() {
    this.socket.emit(this.deviceTopic + '/desired_temperature/inc'); 
  }
  mode(mode) {
    this.socket.emit(this.deviceTopic + '/mode/set', mode); 
  }
}
