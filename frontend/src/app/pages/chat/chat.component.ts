import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Message } from 'src/app/entities/message';
import { HttpService } from 'src/app/services/http.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent{
  public msg = "";
  public username = "";
  public isUserConnected = false;
  public chat : string[] = [];

  constructor(private ws : WebsocketService, public hs : HttpService){}

  public async ngOnInit(){
      this.ws.chatUpdated.subscribe(item => this.updateChat(item));
      this.ws.connected.subscribe(item => this.isUserConnected = item);
      await this.hs.initData();
      this.hs.messages.forEach(element => {
      this.updateChat("["+ element.timestamp +"] "+element.username + " >>> " + element.message);
      });
  }

  public openWebSocket() : void {
    console.log(this.username);
    this.ws.ngopenWebSocket(this.username);

  }

  public closeWebSocket() : void{
    this.ws.closeWebSocket();
  }

  public sendMsg() : void {
    this.ws.sendMessage(this.msg);
    this.msg = "";
  }

  private updateChat(newMessage : string) : void{
    this.chat.push(newMessage);
    
  }

  public saveUsername() : void{
    this.openWebSocket();
  }

  public disconnectChat() : void{
    this.closeWebSocket();
  }
}
