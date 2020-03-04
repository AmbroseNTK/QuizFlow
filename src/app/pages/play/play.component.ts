import { Component, OnInit } from '@angular/core';
import { LobbyService } from 'src/app/services/lobby.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

  constructor(public lobby: LobbyService, public afAuth: AngularFireAuth, public db: AngularFirestore) { }

  startedGame = false;
  hasQuestion = false;
  hasQuestionResult = false;
  hasLeaderboard = false;
  elapsedTime = 0;
  question = {};
  ans = "";
  correctAnswer = "";
  leaderboard = {};

  participants = [];

  ngOnInit() {
    this.lobby.onStartGame = this.onStartGame.bind(this);
    this.lobby.onQuestion = this.onQuestion.bind(this);
    this.lobby.onQuestionResult = this.onQuestionResult.bind(this);
    this.lobby.onLeaderboard = this.onLeaderboard.bind(this);
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "Reload this page will make errors";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    });
    this.db.collection("lobby").doc(this.lobby.lobbyInfo['id']).collection("participants")
      .snapshotChanges().subscribe(snapshot => {
        this.participants = [];
        for (let usr of snapshot) {
          this.participants.push(usr.payload.doc.data());
        }
      })
  }

  onStartGame() {
    this.startedGame = true;
  }

  onQuestion(question) {
    this.ans = "";
    this.question = question;
    this.hasQuestion = true;
    this.elapsedTime = 0;
    let clockId = setInterval(() => {
      if (this.elapsedTime == question['data']['timeout']) {
        this.hasQuestion = false;
        if (this.ans != "") {
          this.lobby.submitAnswer(this.question['lobbyId'], this.question['id'], this.afAuth.auth.currentUser.uid, this.ans);
        }
        clearInterval(clockId);
      }
      this.elapsedTime++;
    }, 1000);
  }

  onQuestionResult(result) {
    this.hasQuestionResult = result.questionId == this.question['id'];
    this.correctAnswer = result.data.correctAnswer;
    setTimeout(() => {
      this.hasQuestionResult = false;
    }, 5000);
  }

  onLeaderboard(leaderboard) {
    this.hasLeaderboard = true;
    this.leaderboard = leaderboard;
  }

  getTimePercent() {
    return Math.ceil(this.elapsedTime / this.question['data']['timeout'] * 100);
  }

  answer(ans) {
    this.ans = ans;
  }

}
