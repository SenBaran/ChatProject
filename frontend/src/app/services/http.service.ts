import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { TouchSequence } from 'selenium-webdriver';
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

  public async getAllUsers(){
    return await this.hs.get<ChatUser[]>(this.url + "/user/getAllUsers").toPromise();
  }


  public async getAllMessages(roomId : Number) {
    return await this.hs.get(this.url + "/message/getAllMessages/" + roomId).toPromise();
  }

  public async getAllRoomsByUserId(userId : Number) {
    var data = await this.hs.get(this.url + "/chatroomuser/getAllRoomsByUserId/" + userId).toPromise();
    console.log(data);
    return data;
  }

  public async getAllUsersByRoomId(roomId : Number) {
    return await this.hs.get(this.url + "/chatroomuser/getAllUsersByRoomId/" + roomId).toPromise();
  }


  public async getUserByUserName(username: String) {
    return this.otherUser = await this.hs.get<ChatUser>(this.url + "/user/byUsername/" + username).toPromise();

  }

  public async getUserByUserNameForChat(username: String) {
    return await this.hs.get<ChatUser>(this.url + "/user/byUsername/" + username).toPromise();

  }

  public async login(eMail: string, password: string) {
    let body = new URLSearchParams();
    body.set('email', eMail);
    body.set('password', password);
    var loggedInData = await this.hs.post(this.url + "/user/login", body.toString(), httpOptions).toPromise();
    this.loggedInUsername = eMail;

    var dataExtract = loggedInData["data"];
    this.loggedInUserId = dataExtract["user_id"];

    return true;

  }

  public async saveMessagePHPBackend(roomId: Number, otherUserId : Number, message: String, loggedInUserId: Number, todayDate : String) {
    let body = new URLSearchParams();
    body.set('roomId', String(roomId));
    body.set('senderUserId', String(loggedInUserId));
    body.set('recieverUserId', String(otherUserId));
    body.set('message', String(message));
    body.set('timestamps', String(todayDate));

    await this.hs.post(this.url + "/message/saveMessage", body.toString(), httpOptions).toPromise();
  }

  public async saveRoomPHPBackend(creator : string, roomName: string){
    let body = new URLSearchParams();
    body.set('creator', creator);
    body.set('roomName', roomName);

    return await this.hs.post(this.url + '/chatroom/saveChatRoom', body.toString(), httpOptions).toPromise();
  }

  public async saveChatRoomUserPHPBackend(roomId : number, userId: number){
    let body = new URLSearchParams();
    body.set('roomId', String(roomId));
    body.set('userId', String(userId));

    var tdata = {
      roomId: String(roomId),
      userId: String(userId)
    }
    console.log(tdata);
    await this.hs.post(this.url + '/chatroomuser/addChatRoomUser', tdata, httpOptions).toPromise();
  }
}
