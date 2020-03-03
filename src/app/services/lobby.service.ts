import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Socket } from 'ngx-socket-io';
import Events from '../events';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(public firestore: AngularFirestore, public httpClient: HttpClient, public socket: Socket) { }

  public cachedLobbies = [];

  public onAcceptToJoin: () => void;
  public onRejectToJoin: () => void;

  public async fetch(uid) {
    let lobbies = await this.firestore.collection("lobby").ref.where("ownerId", "==", uid).get();
    this.cachedLobbies = lobbies.docs.map(doc => doc.data());
    return this.cachedLobbies;
  }

  public async createLobby(uid, name) {
    try {
      await this.httpClient.post(environment.apiEndpoint + "/lobby", {
        uid: uid,
        name: name
      }).toPromise();
    }
    catch (err) {

    }
  }

  public joinLobby(lobbyId, uid, nickName) {
    this.socket.emit("global", {
      event: Events.joinLobby,
      lobbyId: lobbyId,
      uid: uid,
      nickname: nickName
    });
  }

  public listenToServer(uid) {
    this.socket.on(uid, (data) => {
      let event = data.event;
      if (event == Events.acceptJoin) {
        this.onAcceptToJoin();
      }
      else if (event == Events.rejectJoin) {
        this.onRejectToJoin();
      }
    });
  }
}
