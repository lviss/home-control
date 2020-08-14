import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-thermostat',
  templateUrl: './thermostat.component.html',
  styleUrls: ['./thermostat.component.scss']
})
export class ThermostatComponent implements OnInit, OnDestroy {

  @Input() deviceName: string;
  deviceTopic: string;
  state;
  subscription;
  constructor(private socket: Socket) { }

  ngOnInit() {
    this.deviceTopic = 'devices/' + this.deviceName;
    this.subscription = this.socket.fromEvent(this.deviceTopic + '/get')
      .pipe(map( (data:string) => JSON.parse(data) ))
      .subscribe(data => this.state = data);
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
