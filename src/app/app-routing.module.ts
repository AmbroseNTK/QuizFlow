import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { PlayComponent } from './pages/play/play.component';


const routes: Routes = [{
  path: "",
  component: LoginComponent
}, {
  path: "lobby/:id",
  component: LobbyComponent
}, {
  path: "play/:id",
  component: PlayComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
