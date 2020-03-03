import { Component, OnInit } from '@angular/core';
import { LobbyService } from 'src/app/services/lobby.service';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AngularFireAuth } from '@angular/fire/auth';
import { NbToastrService } from '@nebular/theme';

@Component({
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  constructor(public lobby: LobbyService, public toaster: NbToastrService, public afAuth: AngularFireAuth, public activatedRoute: ActivatedRoute, public db: AngularFirestore, public http: HttpClient) { }

  selectedLobby = undefined;
  questions = [];

  questionId = "";
  question = "";
  answerA = "";
  answerB = "";
  answerC = "";
  answerD = "";
  correctAnswer = "";
  timeout = 10;

  onAir = false;


  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.selectedLobby = this.lobby.cachedLobbies.filter(l => l.id == params.id)[0];
      if (this.selectedLobby != undefined) {
        this.db.collection("lobby").doc(this.selectedLobby.id).ref.collection("questions").onSnapshot((snapshot) => {
          this.questions = [];
          snapshot.docs.map(doc => {
            this.questions.push({
              id: doc.id,
              data: {
                ...doc.data()
              }

            })
          });
          console.log(this.questions);
        })
      }
    });
  }


  selectQuestion(quest) {
    this.questionId = quest.id;
    this.question = quest.data.question;
    this.answerA = quest.data.answerA;
    this.answerB = quest.data.answerB;
    this.answerC = quest.data.answerC;
    this.answerD = quest.data.answerD;
    this.correctAnswer = quest.data.correctAnswer;
    this.timeout = quest.data.timeout;
  }

  async createQuestion() {
    try {
      let result = await this.http.post(environment.apiEndpoint + "/lobby/questions", {
        uid: this.afAuth.auth.currentUser.uid,
        lobbyId: this.selectedLobby.id,
        question: this.question,
        answerA: this.answerA,
        answerB: this.answerB,
        answerC: this.answerC,
        answerD: this.answerD,
        correctAnswer: this.correctAnswer,
        timeout: this.timeout
      }).toPromise();
      this.toaster.success("Question is created", "Success", {
        duration: 2000
      });
      this.resetAllField();
    }
    catch (err) {
      console.log(err);
      this.toaster.danger(err, "Something went wrong", {
        duration: 5000
      });
    }
  }

  private resetAllField() {
    this.questionId = "";
    this.question = "";
    this.answerA = "";
    this.answerB = "";
    this.answerC = "";
    this.answerD = "";
    this.correctAnswer = "";
    this.timeout = 0;
  }

  updateQuestion() {
    this.db.collection("lobby").doc(this.selectedLobby.id)
      .ref.collection("questions").doc(this.questionId)
      .set({
        question: this.question,
        answerA: this.answerA,
        answerB: this.answerB,
        answerC: this.answerC,
        answerD: this.answerD,
        correctAnswer: this.correctAnswer,
        timeout: this.timeout
      }).then(() => {
        this.toaster.success("Update success", "Success", { duration: 2000 });
        this.resetAllField();
      }).catch((err) => {
        this.toaster.danger(err, "Error", { duration: 5000 });
      });

  }

  deleteQuestion() {
    this.db.collection("lobby").doc(this.selectedLobby.id)
      .ref.collection("questions").doc(this.questionId)
      .delete()
      .then(() => {
        this.toaster.success("This question was deleted", "Success", { duration: 2000 });
        this.resetAllField();
      })
      .catch((err) => {
        this.toaster.danger(err, "Failed", { duration: 5000 });
      })
  }

  deleteLobby() {
    this.db.collection("lobby").doc(this.selectedLobby.id).delete()
      .then(() => this.toaster.success("This lobby was deleted", "Success", { duration: 2000 }))
      .then(() => location.reload())
      .catch((err) => {
        this.toaster.danger(err, "Failed", { duration: 5000 });
      })
  }

  startStreaming() {
    this.onAir = true;
  }

  stopStreaming() {
    this.onAir = false;
  }

  broadcastQuestion(quest) {

  }

}
