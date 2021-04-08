import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatUserDto } from '../dtos/chat-user-dto';
import { ChatUser } from '../entities/user';
import { Message } from '../entities/message';
import { MessageDto } from '../dtos/message-dto';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public users : ChatUser[] = [];
  public messages : Message[] = [];
  
  private hs : HttpClient;
  public loggedInChatUser : ChatUser;
  private url = "http://localhost:9000/api/";
  constructor(hs : HttpClient ) { 
    this.hs = hs;
  }

  public async initData(){
    this.messages = await this.hs.get<Message[]>(this.url + "getAllMessages").toPromise();

    
  }

}
