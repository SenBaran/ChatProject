import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { ChatUser } from '../entities/user';



const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  })
};

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private hs: HttpClient;
  public otherUser : ChatUser;
  constructor(hs: HttpClient) { this.hs = hs }
  private url = "http://devapi.xtechnik.com";
  public loggedInUsername: string = "";

  public async getUserByUserName(username: String) {
    this.otherUser = await this.hs.get<ChatUser>(this.url + "/user/byUsername/" + username).toPromise();
    console.log(this.otherUser);

  }

  public async login(eMail: string, password: string) {

    var data = {
      email: eMail,
      password: password
    };

    console.log(data);

    await this.hs.post(this.url + "/user/login", data, httpOptions).subscribe();
    this.loggedInUsername = eMail;
    return true;
  }

}
