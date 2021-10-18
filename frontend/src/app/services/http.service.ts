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
  public loggedInUserId : string = "";
  public messages = [];


  public async getUserById(userId : Number){
    return await this.hs.get(this.url + "/user/byId/" + userId).toPromise();
  }


  public async getAllMessages(userId : Number) {
    return await this.hs.get(this.url + "/message/getAllMessages/" + userId).toPromise();
  }

  public async getUserByUserName(username: String) {
    this.otherUser = await this.hs.get<ChatUser>(this.url + "/user/byUsername/" + username).toPromise();

  }

  public async login(eMail: string, password: string) {

    let body = new URLSearchParams();
    body.set('email', eMail);
    body.set('password', password);
    var loggedInData = await this.hs.post(this.url + "/user/login", body.toString(), httpOptions).toPromise();
    this.loggedInUsername = eMail;

    var dataExtract = loggedInData["data"];
    this.loggedInUserId = dataExtract["user_id"];

    console.log(dataExtract);
    console.log(this.loggedInUserId); 
    return true;

  }

  public async saveMessagePHPBackend(roomId: Number, otherUserId : Number, message: String, loggedInUserId: Number , nowDate2: string) {
    

    let body = new URLSearchParams();
    body.set('roomId', String(roomId));
    body.set('senderUserId', String(loggedInUserId));
    body.set('recieverUserId', String(otherUserId));
    body.set('message', String(message));
    body.set('timestamp', nowDate2);


    await this.hs.post(this.url + "/message/saveMessage", body.toString(), httpOptions).toPromise();

  }

}
