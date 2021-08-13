import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { LoginpageComponent } from './pages/loginpage/loginpage.component';

const routes: Routes = [
  { path: 'chat', component: ChatComponent},
  { path: '' , redirectTo : '/loginpage', pathMatch : 'full'},
  { path: 'loginpage', component: LoginpageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
