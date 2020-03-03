import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { LobbyService } from 'src/app/services/lobby.service';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(public afAuth: AngularFireAuth, public router: Router, public toaster: NbToastrService, public lobby: LobbyService) { }

  ngOnInit() {
    this.lobby.onAcceptToJoin = this.onAcceptToJoin.bind(this);
    this.lobby.onRejectToJoin = this.onRejectToJoin.bind(this);
    this.afAuth.authState.subscribe(usr => {
      this.loggedIn = true;
      this.lobby.listenToServer(usr.uid);
    });
  }

  loggedIn = false;
  lobbyId = "";
  nickname = "";

  async loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    await this.afAuth.auth.signInWithPopup(provider);
  }

  join() {
    this.lobby.joinLobby(this.lobbyId, this.afAuth.auth.currentUser.uid, this.nickname);
  }

  onAcceptToJoin() {
    this.toaster.success("Joined", "Success", { duration: 2000 });
    this.router.navigate(["play/" + this.lobbyId]);
  }

  onRejectToJoin() {
    this.toaster.danger("Failed to join this lobby", "Failed", { duration: 5000 });
  }

}
