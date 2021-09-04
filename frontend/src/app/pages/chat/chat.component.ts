import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { allowedNodeEnvironmentFlags } from 'process';
import { logging } from 'protractor';
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
  public currentRoom : Room;
  


  constructor(private ws : WebsocketService, public hs : HttpService){}

  public async ngOnInit(){
      this.ws.connected.subscribe();
      this.ws.chatUpdated.subscribe(item => this.updateChat(item));
      this.ws.ngopenWebSocket(this.hs.loggedInUsername);
      //this.ws.usersUpdated.subscribe(item => this.addToUsersList(item));

  }

  public closeWebSocket() : void{
    this.ws.closeWebSocket();
  }

  public sendMsg() : void {
    this.ws.sendMessage(this.msg, this.currentRoom.roomUsers[1]);
    this.msg = "";
  }

  private updateChat(newMessageObject : string) : void{

    this.toJSON = JSON.parse(newMessageObject)

    if(this.allRooms == null) {
      this.allRooms.push(new Room(this.allRooms.length + 1, [this.toJSON["message"]], [this.hs.loggedInUsername, this.toJSON["username"]]))

    }else if(this.currentRoom != null && this.currentRoom.roomUsers.includes(this.toJSON["username"]) && this.currentRoom.roomUsers.includes(this.hs.loggedInUsername)){
      console.log("this.currentRoom != null && this.currentRoom.roomUsers.includes(this.toJSON && this.currentRoom.roomUsers.includes(this.hs.loggedInUsername)")
      this.currentRoom.chat.push(this.toJSON["message"]);
      //this.chat.push(this.toJSON["message"])
    }else if(!this.checkIfRoomAlreadyExist(this.hs.loggedInUsername, this.toJSON["username"])){
      console.log("!this.checkIfRoomAlreadyExist(this.hs.loggedInUsername, this.toJSON");
      var newRoom = new Room(this.allRooms.length + 1, [this.toJSON["message"]], [this.hs.loggedInUsername, this.toJSON["username"]])
      
      this.allRooms.push(newRoom)
      this.users.push(this.toJSON["username"]);
      var nowDate = new Date();
      var nowDate2 = nowDate.getTime().toString();
      console.log("----------------------")
      console.log(this.toJSON);
      console.log("---------------------------------------")
      this.saveMessageToPHPBackend(newRoom.roomId, this.toJSON["username"],this.toJSON["message"], this.hs.loggedInUsername, nowDate2);
      //roomId: Number, fromUsername : String, message: String, loggedInUsername: string, nowDate2: string
      console.log(this.allRooms);

    }else{
      let redirectMessageRoom = this.getCorrectRoomByUsernames(this.hs.loggedInUsername, this.toJSON["username"]);
      redirectMessageRoom.chat.push(this.toJSON["message"]);

    }
    
  }


  private async saveMessageToPHPBackend(roomId: Number, fromUsername : String, message: String, loggedInUsername: string, nowDate2: string) {
    await this.hs.saveMessagePHPBackend(roomId,fromUsername, message ,loggedInUsername, nowDate2);
  }
  
  public async saveUsername(){
    await this.hs.getUserByUserName(this.username)
    let helpVar = new Room(this.allRooms.length + 1, [], [this.hs.loggedInUsername, this.hs.otherUser.username]);
    this.allRooms.push(helpVar);
    this.users.push(this.hs.otherUser.username)

  }

/**
 * Startet den Chat, den der Benutzer ausgewählt hat
 * @param clickedUsername 
 */
  public startChat(clickedUsername : string) : void{

    console.log(clickedUsername);

    if(this.currentRoom != null && this.currentRoom.roomUsers.includes(clickedUsername)){
      alert("Sie chatten schon mit dieser Person");
    }else{
      let room = this.getCorrectRoomByUsernames(this.hs.loggedInUsername, clickedUsername);
      this.currentRoom = room;
      this.chat = this.currentRoom.chat;
    }

  }



  /**
   * Checkt ob der Raum schon existiert.
   * @param loggedInUsername 
   * @param cameFromUserName 
   * @returns Boolean
   */
  private checkIfRoomAlreadyExist(loggedInUsername : String, cameFromUserName: String) : boolean {
    this.allRooms.forEach(s => {
      if(s.roomUsers.includes(cameFromUserName) && s.roomUsers.includes(loggedInUsername)){
        return true;
      }
    })

    return false;
  }
  
/**
 * Methode gibt den Raum zurück, in dem die User chatten.
 * @returns Room 
 */
  private getCorrectRoomByUsernames(loggedInUsername : String, cameFromUserName: String) : Room{

    var helpVar = null;
    this.allRooms.forEach(s => {
      if(s.roomUsers.includes(cameFromUserName) && s.roomUsers.includes(loggedInUsername)){
        helpVar = s;     
      }
    })

    return helpVar;
  } 

}



