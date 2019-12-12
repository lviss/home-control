import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-garage-door',
  templateUrl: './garage-door.component.html',
  styleUrls: ['./garage-door.component.scss']
})
export class GarageDoorComponent implements OnInit {

  @Input() openerName: string;
  @Input() sensorName: string;

  state$;

  constructor(private socket: Socket) { }

  ngOnInit() {
    let topic = 'devices/' + this.sensorName;
    this.state$ = this.socket.fromEvent(topic).pipe(map( (data:string) => JSON.parse(data) ));
  }

  toggleGarage(event) {
    console.log('devices/' + this.openerName + '/command'); 
    this.socket.emit('devices/' + this.openerName + '/command', {"action":"push_button"}); 
  }

  garageLabel(state) {
    if (!state)
      return 'unknown';
    return state.open ? 'open' : 'closed';
  }
}
