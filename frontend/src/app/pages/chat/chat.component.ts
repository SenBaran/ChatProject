import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Message } from 'src/app/entities/message';
import { Room } from 'src/app/entities/room';
import { ChatUser } from 'src/app/entities/user';
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
  public chat : string[] = [];
  public users = [];
  private toJSON : JSON;
  private allRooms : Room[] = [];
  private currentRoom : Room;

  constructor(private ws : WebsocketService, public hs : HttpService){}

  public async ngOnInit(){
      this.ws.connected.subscribe();
      this.ws.chatUpdated.subscribe(item => this.updateChat(item));
      this.ws.ngopenWebSocket(this.hs.loggedInUsername);
      //this.ws.usersUpdated.subscribe(item => this.addToUsersList(item));

  }

  /*private addToUsersList(message : string) {

    this.toAddUsername = message.split(/[ ] :]+/);
    console.log(this.toAddUsername);
    if(this.users.includes(this.toAddUsername[1])){
      alert("Sie haben eine Nachricht von " + this.toAddUsername[1]);
    }else{
      console.log(this.users);
      this.users.push(this.toAddUsername[1]);
    }

  }*/

  public closeWebSocket() : void{
    this.ws.closeWebSocket();
  }

  public sendMsg() : void {
    this.ws.sendMessage(this.msg, this.hs.otherUser.username);
    this.msg = "";
  }

  private updateChat(newMessageObject : string) : void{

    this.toJSON = JSON.parse(newMessageObject)

    if(this.currentRoom.roomUsers.includes(this.toJSON["username"]) && this.currentRoom.roomUsers.includes(this.hs.loggedInUsername)){
      console.log("User ist hier")
      this.currentRoom.chat.push(this.toJSON["message"]);
      //this.chat.push(this.toJSON["message"]);
    }else {
      console.log("Neuer User")
      this.users.push(this.toJSON["username"]);
      this.allRooms.push(new Room(this.allRooms.length + 1, [this.toJSON["message"]], [this.hs.loggedInUsername, this.toJSON["username"]]))
      //this.hs.otherUser.username = this.toJSON["username"];
    }
    
  }

  public async saveUsername(){
    await this.hs.getUserByUserName(this.username)
    this.allRooms.push(new Room(this.allRooms.length + 1, [], [this.hs.loggedInUsername, this.hs.otherUser.username]))
    this.users.push(this.hs.otherUser.username)

  }


  public startChat() : void{

    if(this.currentRoom != null && this.currentRoom.roomUsers.includes(this.hs.otherUser)){
      console.log("Sie chatten schon mit dieser Person")
    }
    else{
        this.allRooms.forEach(s => {
        if(s.roomUsers.includes(this.hs.otherUser.username) && s.roomUsers.includes(this.hs.loggedInUsername)){
          this.currentRoom = s;
          this.chat = this.currentRoom.chat;
          
        }
      })
    }

  }
}
