import { Component, OnInit } from '@angular/core';
import { LobbyService } from 'src/app/services/lobby.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

  constructor(public lobby: LobbyService, public afAuth: AngularFireAuth) { }

  startedGame = false;
  hasQuestion = false;
  hasQuestionResult = false;
  elapsedTime = 0;
  question = {};
  ans = "";
  correctAnswer = "";

  ngOnInit() {
    this.lobby.onStartGame = this.onStartGame.bind(this);
    this.lobby.onQuestion = this.onQuestion.bind(this);
    this.lobby.onQuestionResult = this.onQuestionResult.bind(this);
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

  getTimePercent() {
    return Math.ceil(this.elapsedTime / this.question['data']['timeout'] * 100);
  }

  answer(ans) {
    this.ans = ans;
  }

}
