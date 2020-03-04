import { Component, TemplateRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LobbyService } from './services/lobby.service';
import { NbDialogService, NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Kahoot';
  usr = null;
  lobbies = [];
  constructor(public afAuth: AngularFireAuth, public sidebarService: NbSidebarService, public lobby: LobbyService, public dialogService: NbDialogService, public router: Router) {
    afAuth.authState.subscribe(async usr => {
      if (usr != null) {
        this.usr = usr;
        console.log(usr);
        let lobbies = await this.lobby.fetch(usr.uid);
        this.lobbies = lobbies;
        console.log(lobbies);
      }
    });
    this.sidebarService.toggle(false);
  }

  createNewLobby(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, { context: 'this is some additional data passed to dialog' });
  }

  lobbyName = "";
  async submitLobby() {
    await this.lobby.createLobby(this.afAuth.auth.currentUser.uid, this.lobbyName);
    this.lobbyName = "";
    location.reload();
  }

  openLobby(id) {
    this.router.navigate(["lobby/" + id]);
  }

  onClickAccount() {
    location.href = "/";
  }

  onClickCreateLobby() {
    this.sidebarService.toggle();
  }

}
