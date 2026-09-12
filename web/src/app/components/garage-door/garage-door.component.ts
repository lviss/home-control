import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { SocketCacheService } from '../../services/socket-cache.service';

@Component({
  selector: 'app-garage-door',
  templateUrl: './garage-door.component.html',
  styleUrls: ['./garage-door.component.scss']
})
export class GarageDoorComponent implements OnInit {

  @Input() openerName: string;
  @Input() sensorName: string;

  state$;
  connected$;

  constructor(
    private socket: Socket,
    private socketCache: SocketCacheService
  ) { }

  ngOnInit() {
    const topic = 'devices/' + this.sensorName;
    this.state$ = this.socket.fromEvent(topic)
      .pipe(map( (data: string) => JSON.parse(data) ));
    this.connected$ = this.socketCache.fromEvent('devices/' + this.openerName + '/clientstatus')
      .pipe(map((data: string) => data !== 'lost connection'));
  }

  toggleGarage(event) {
    this.socket.emit('devices/' + this.openerName + '/command', {action: 'push_button'});
  }

  garageLabel(state) {
    if (!state) {
      return 'unknown';
    }
    return state.open ? 'open' : 'closed';
  }
}
