import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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
  public onStartGame: () => void;
  public onQuestion: (question) => void;
  public onQuestionResult: (question) => void;
  public onLeaderboard: (leaderboard) => void;
  public hasRegistered = false;
  public lobbyInfo = {};

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

  public startStreaming(uid, lobbyId) {
    this.socket.emit("global", {
      event: Events.sendStartStreaming,
      lobbyId: lobbyId,
      uid: uid
    });
  }

  public startGame(lobbyId) {
    this.socket.emit("global", {
      event: Events.sendStartGame,
      lobbyId: lobbyId
    });
  }

  public joinLobby(lobbyId, uid, nickName) {
    this.socket.emit("global", {
      event: Events.joinLobby,
      lobbyId: lobbyId,
      uid: uid,
      nickname: nickName
    });
  }

  public broadcastQuestion(quest) {
    this.socket.emit("global", {
      event: Events.sendQuestion,
      ...quest
    });
  }

  public sendResult(quest) {
    this.socket.emit("global", {
      event: Events.sendQuestionResult,
      ...quest
    });
  }

  public submitAnswer(lobbyId, questionId, uid, answer) {
    this.socket.emit("global", {
      event: Events.sendAnswer,
      lobbyId: lobbyId,
      questionId: questionId,
      uid: uid,
      answer: answer
    });
  }

  public async clearQuestionResult(uid, lobbyId, questionId) {
    let result = await this.httpClient.post(environment.apiEndpoint + "/lobby/clearResult", {
      uid: uid,
      lobbyId: lobbyId,
      questionId: questionId
    }).toPromise();
    console.log(result);
  }

  public sendLeaderboard(lobbyId) {
    this.socket.emit("global", {
      event: Events.sendLeaderboard,
      lobbyId: lobbyId
    });
  }

  public listenToServer(uid) {
    if (!this.hasRegistered) {
      this.socket.fromEvent<any>(uid).subscribe((data) => {
        console.log(data);
        let event = data.event;
        if (event == Events.acceptJoin) {
          this.onAcceptToJoin();
        }
        else if (event == Events.rejectJoin) {
          this.onRejectToJoin();
        }
        else if (event == Events.startGame) {
          this.onStartGame();
        }
        else if (event == Events.question) {
          this.onQuestion(data.question);
        }
        else if (event == Events.questionResult) {
          if (this.onQuestionResult != null) {
            this.onQuestionResult(data);
          }
        }
        else if (event == Events.leaderboard) {
          if (this.onLeaderboard != null) {
            this.onLeaderboard(data.leaderboard);
          }
        }
      });
      this.hasRegistered = true;
    }
  }
}
