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

  public async saveMessagePHPBackend(roomId: Number, fromUsername : String, message: String, loggedInUsername: string, nowDate2: string) {
    
    var data = {
      roomId: roomId,
      fromUsername: fromUsername,
      toUsername: loggedInUsername,
      message: message,
      timestamp: nowDate2
    };
    console.log(data);


    await this.hs.post(this.url + "/message/saveMessage", data, httpOptions).toPromise();

  }

}
