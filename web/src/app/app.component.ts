import { Component, HostListener } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'home-control-web';
  mobile = false;
  opened = false;

  constructor(
    private socket: Socket, 
    private snackbar: MatSnackBar,
    private swUpdate: SwUpdate,
    private http: HttpClient
  ) { 
    // check for service worker updates
    if (swUpdate.isEnabled) {
      interval(60 * 60 * 1000).subscribe(() => swUpdate.checkForUpdate()
        .then(() => console.log('checking for updates')));
    }
    this.swUpdate.available.subscribe(event => this.promptUpdate());
  }

  ngOnInit() {
    this.mobile = window.screen.width <= 800;
    this.opened = !this.mobile;
    this.socket.on('connect', () => this.snackbar.open('Connected!', 'Ok', { duration: 3000 }));
    this.socket.on('disconnect', (err) => this.snackbar.open('Disconnected', 'Ok'));
    this.socket.on('error', (err) => this.handleError(err, 'error'));
    this.socket.on('reconnect_error', (err) => this.snackbar.open('Reconnecting...'));
    this.socket.on('reconnect_failed', (err) => this.snackbar.open('Reconnect failed', 'Ok'));
  }

  private promptUpdate(): void {
    console.log('updating to new version');
    let snack = this.snackbar.open('A new version is available!', 'Update', { duration: undefined });
    snack.onAction().subscribe(() => {
      this.swUpdate.activateUpdate().then(() => document.location.reload());
    });
  }

  handleError(err, from) {
    if (err === 'Authentication error') {
      this.socket.disconnect();
      this.http.get('/auth/refresh').subscribe(res => {
        this.socket.connect();
      });
    } else {
      this.snackbar.open(err, 'Ok');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = event.target.innerWidth <= 800;
    this.opened = !this.mobile;
  }

}
