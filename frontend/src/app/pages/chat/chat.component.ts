import { Component, OnInit, SystemJsNgModuleLoader } from '@angular/core';
import { FormControl } from '@angular/forms';
import { allowedNodeEnvironmentFlags } from 'process';
import { logging } from 'protractor';
import { TouchSequence } from 'selenium-webdriver';
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
  private userId : number = -1;
  


  constructor(private ws : WebsocketService, public hs : HttpService){}

  public async ngOnInit(){
      this.ws.connected.subscribe();
      this.ws.chatUpdated.subscribe(item => this.updateChat(item));
      this.ws.ngopenWebSocket(this.hs.loggedInUsername);
      this.loadAllMessages();
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
      this.allRooms.push(new Room(this.allRooms.length + 1, [this.toJSON["message"]], [this.hs.loggedInUsername, this.toJSON["username"]]));



    }else if(this.currentRoom != null && this.currentRoom.roomUsers.includes(this.toJSON["username"]) && this.currentRoom.roomUsers.includes(this.hs.loggedInUsername)){
      console.log("this.currentRoom != null && this.currentRoom.roomUsers.includes(this.toJSON && this.currentRoom.roomUsers.includes(this.hs.loggedInUsername)");

      this.currentRoom.chat.push(this.toJSON["message"]);
      var nowDate = Date.now();
      this.saveMessageToPHPBackend(this.currentRoom.roomId,this.toJSON["message"], String(nowDate));

    }else if(!this.checkIfRoomAlreadyExist(this.hs.loggedInUsername, this.toJSON["username"])){
      console.log("!this.checkIfRoomAlreadyExist(this.hs.loggedInUsername, this.toJSON");

      var newRoom = new Room(this.allRooms.length + 1, [this.toJSON["message"]], [this.hs.loggedInUsername, this.toJSON["username"]]);
      
      this.allRooms.push(newRoom);
      this.users.push(this.toJSON["username"]);
      var nowDate = Date.now();

      this.saveMessageToPHPBackend(newRoom.roomId,this.toJSON["message"], String(nowDate));


    }else{
      let redirectMessageRoom = this.getCorrectRoomByUsernames(this.hs.loggedInUsername, this.toJSON["username"]);
      redirectMessageRoom.chat.push(this.toJSON["message"]);

    }
    
  }


  private async saveMessageToPHPBackend(roomId: Number, message: String, nowDate2: string) {
    console.log(this.hs.otherUser.user_id);
    console.log(this.hs.loggedInUserId);
    await this.hs.saveMessagePHPBackend(roomId, Number(this.hs.otherUser.user_id), message , Number(this.hs.loggedInUserId), nowDate2);
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

  private async loadAllMessages() {
    var responseData =  await this.hs.getAllMessages(Number(this.hs.loggedInUserId));
    
    var allMessages = responseData["data"];

    for (let i = 0; i < allMessages.length; i++) {
      var messages = [];
      if(this.allRooms.length != 0){
        
      }else{
        var firstRoomToAdd = allMessages[i]["room_id"];
        
        for (let y = 0; y < allMessages.length; y++) {
          
          if(firstRoomToAdd == allMessages[y]["room_id"]){
            messages.push(allMessages[y]["message"]);
          }
        }

        var otherChatter = await this.hs.getUserById(allMessages[i]["reciever_user_id"]);
        console.log(otherChatter);
        this.allRooms.push(new Room(firstRoomToAdd, messages, [this.hs.loggedInUsername, otherChatter["username"]]));
        this.users.push(otherChatter["username"]);

      }

    }
    console.log(this.allRooms);

  }
}





