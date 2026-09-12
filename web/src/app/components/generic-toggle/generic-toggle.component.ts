import { Component, OnInit, Input } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SocketCacheService } from '../../services/socket-cache.service';

@Component({
  selector: 'app-generic-toggle',
  templateUrl: './generic-toggle.component.html',
  styleUrls: ['./generic-toggle.component.scss']
})
export class GenericToggleComponent implements OnInit {

  @Input() topic: string;

  state$;

  constructor(
    private socket: Socket,
    private socketCache: SocketCacheService
  ) { }

  ngOnInit() {
    this.state$ = this.socketCache.fromEvent(this.topic)
    //this.state$ = this.socket.fromEvent(this.topic);
  }

  onChange(event) {
    this.socket.emit(this.topic, event.checked ? "1" : "0");
  }
}
