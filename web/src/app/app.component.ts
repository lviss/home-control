import { Component, HostListener } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'home-control-web';
  mobile = false;
  opened = false;
  showingSnackbar = false;

  constructor(private socket: Socket, private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.mobile = window.screen.width <= 800;
    this.opened = !this.mobile;
    this.socket.on('connect', () => this.hideSnackbar());
    this.socket.on('disconnect', () => this.showReconnecting());
    this.socket.on('error', () => this.showReconnecting());
    this.socket.on('reconnect_error', () => this.showReconnecting());
    this.socket.on('reconnect_failed', () => this.snackbar.open('reconnect failed.'));
  }

  hideSnackbar() {
    this.snackbar.dismiss();
    this.showingSnackbar = false;
  }

  showReconnecting() {
    if (!this.showingSnackbar) {
      this.snackbar.open('reconnecting...');
      this.showingSnackbar = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = event.target.innerWidth <= 800;
    this.opened = !this.mobile;
  }

}
