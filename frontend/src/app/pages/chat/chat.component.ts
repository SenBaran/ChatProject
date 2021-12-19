import { AfterViewInit, Component, ElementRef, OnInit, SystemJsNgModuleLoader, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { allowedNodeEnvironmentFlags } from 'process';
import { logging } from 'protractor';
import { Observable } from 'rxjs';
import { TouchSequence } from 'selenium-webdriver';
import { Message } from 'src/app/entities/message';
import { Room } from 'src/app/entities/room';
import { ChatUser } from 'src/app/entities/user';
import { HttpService } from 'src/app/services/http.service';
import { createBrotliCompress } from 'zlib';
import { WebsocketService } from '../../services/websocket.service';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  public msg = "";
  public username = "";
  public chat: string[] = [];
  public users = [];
  private toJSON: JSON;
  private allRooms: Room[] = [];
  public currentRoom: Room;
  public allUsersInContactList: ChatUser[] = [];
  public myControl = new FormControl();
  public filteredOptions: Observable<ChatUser[]>;
  public currentOtherUser = "";
  public loggedInUserId;

  constructor(private ws: WebsocketService, public hs: HttpService) { }

  public async ngOnInit() {
    this.ws.connected.subscribe();
    this.ws.chatUpdated.subscribe(item => this.updateChat(item));
    this.ws.ngopenWebSocket(this.hs.loggedInUsername);
    this.loadAllRooms();
    this.loadAllUsers();
    //this.loadAllMessages();
    //this.ws.usersUpdated.subscribe(item => this.addToUsersList(item));
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
    this.loggedInUserId = this.hs.loggedInUserId;
  }


  private _filter(value: string): ChatUser[] {
    const filterValue = value.toLowerCase();

    return this.allUsersInContactList.filter(option => option.username.toLowerCase().includes(filterValue));
  }

  public closeWebSocket(): void {
    this.ws.closeWebSocket();
  }

  public sendMsg(): void {

    if(this.msg.length != 0){
      this.ws.sendMessage(this.msg, this.currentRoom.roomUsers[1]);
      var todayDate = Date.now();
      this.saveMessageToPHPBackend(this.currentRoom.roomId, this.msg, todayDate.toString());
      this.msg = "";
    }else{
      alert("Bitte geben Sie eine Nachricht ein!")
    }


  }


  private async updateChat(newMessageObject: string) {

    this.toJSON = JSON.parse(newMessageObject)
    var todayDate = Date.now();
    if (this.allRooms == null) {
      this.allRooms.push(new Room(this.allRooms.length + 1, [this.toJSON["message"]], [this.hs.loggedInUsername, this.toJSON["username"]]));

    } else if (this.currentRoom != null && this.currentRoom.roomUsers.includes(this.toJSON["username"]) && this.currentRoom.roomUsers.includes(this.hs.loggedInUsername)) {

      var getUserId = await this.hs.getUserByUserNameForChat(this.toJSON["username"]);
      console.log(this.toJSON["username"])
      console.log(getUserId);
      console.log(todayDate);
      this.currentRoom.chat.push(new Message(this.toJSON["message"], getUserId["user_id"].toString(), todayDate.toString()));

    } else if (!this.checkIfRoomAlreadyExist(this.hs.loggedInUsername, this.toJSON["username"])) {
      console.log("!this.checkIfRoomAlreadyExist(this.hs.loggedInUsername, this.toJSON");

      this.loadAllRooms();
      this.users.push(this.hs.getUserByUserNameForChat(this.toJSON["username"]));

    } else {
      var getUserId = await this.hs.getUserByUserNameForChat(this.toJSON["username"]);
      let redirectMessageRoom = this.getCorrectRoomByUsernames(this.hs.loggedInUsername, this.toJSON["username"]);
      redirectMessageRoom.chat.push(new Message(this.toJSON["message"], getUserId["user_id"].toString(), todayDate.toString()));

    }

  }


  /**
   * Speichert die neue Nachricht ins Backend
   * @param roomId 
   * @param message 
   * @param nowDate2 
   */
  private async saveMessageToPHPBackend(roomId: Number, message: String, todayDate : String) {
    console.log(this.hs.otherUser.user_id);
    console.log(this.hs.loggedInUserId);
    await this.hs.saveMessagePHPBackend(roomId, Number(this.hs.otherUser.user_id), message, Number(this.hs.loggedInUserId), todayDate);
  }


  /**
   * Speichert und legt mit dem neuen User einen Raum an
   */
  public async saveUsername() {
    var newUser = await this.hs.getUserByUserName(this.username)

    var newRoom = await this.createRoom(this.hs.loggedInUsername, "");
    this.allRooms.push(newRoom);
    this.users.push(newUser);

  }

  /**
   * Startet den Chat, den der Benutzer ausgewählt hat
   * @param clickedUsername 
   */
  public async startChat(clickedUser : ChatUser) {
    if (this.currentRoom != null && this.currentRoom.roomUsers.includes(clickedUser.username)) {
      alert("Sie chatten schon mit dieser Person");
    } else {
      var room = this.getCorrectRoomByUsernames(this.hs.loggedInUsername, clickedUser.username);
      if(room != null){

        if (room.chat != null && room.chat.length != 0) {
          console.log("test1");
          console.log(room.roomId);
          this.currentRoom = room;
          this.chat = this.currentRoom.chat;
          this.hs.getUserByUserName(clickedUser.username);
          this.currentOtherUser = clickedUser.firstname +" "+ clickedUser.lastname;
        } else {
          this.loadAllMessages(room.roomId)
          this.currentRoom = room;
          this.chat = this.currentRoom.chat;
          this.hs.getUserByUserName(clickedUser.username);
          this.currentOtherUser = clickedUser.firstname +" "+ clickedUser.lastname;
        }

      }else{
        var newUser = await this.hs.getUserByUserName(clickedUser.username);
        var newRoom = await this.createRoom(this.hs.loggedInUsername, "");
        this.allRooms.push(newRoom);
        this.currentRoom = newRoom;
        this.users.push(newUser);
        this.chat = this.currentRoom.chat;
        this.currentOtherUser = clickedUser.firstname +" "+ clickedUser.lastname;

      }
    }

  }



  /**
   * Checkt ob der Raum schon existiert.
   * @param loggedInUsername 
   * @param cameFromUserName 
   * @returns Boolean
   */
  private checkIfRoomAlreadyExist(loggedInUsername: String, cameFromUserName: String): boolean {
    this.allRooms.forEach(s => {
      if (s.roomUsers.includes(cameFromUserName) && s.roomUsers.includes(loggedInUsername)) {
        return true;
      }
    })

    return false;
  }

  /**
   * Methode gibt den Raum zurück, in dem die User chatten.
   * @returns Room 
   */
  private getCorrectRoomByUsernames(loggedInUsername: String, cameFromUserName: String): Room {
    var helpVar = null;
    this.allRooms.forEach(s => {
      if (s.roomUsers.includes(cameFromUserName) && s.roomUsers.includes(loggedInUsername)) {
        helpVar = s;
      }
    })

    return helpVar;
  }


  private async createRoom(creator: string, roomName: string) {
    var createdRoomId = await this.hs.saveRoomPHPBackend(this.hs.loggedInUsername, "");
    let helpVar = new Room(Number(createdRoomId["data"]["id"]), [], [this.hs.loggedInUsername, this.hs.otherUser.username]);
    await this.hs.saveChatRoomUserPHPBackend(Number(createdRoomId["data"]["id"]), Number(this.hs.loggedInUserId));
    await this.hs.saveChatRoomUserPHPBackend(Number(createdRoomId["data"]["id"]), Number(this.hs.otherUser.user_id));


    return helpVar;
  }

  /**
   * Methode ladet alle Nachrichten, die der eingeloggte User geschrieben hat.
   */
  private async loadAllMessages(roomId: any) {
    var responseData = await this.hs.getAllMessages(Number(roomId));
    var allMessages = responseData["data"];
    console.log(allMessages);
    console.log(allMessages);
    if(allMessages != null){
      this.allRooms.forEach(oneRoom => {
        if (oneRoom.roomId == roomId) {
          for (let i = 0; i < allMessages.length; i++) {
            oneRoom.chat.push(new Message(allMessages[i]["message"], allMessages[i]["sender_user_id"], allMessages[i]["timestamps"]));
          }
        }
      });

      console.log(this.allRooms)
    }

  }


  public async loadAllRooms() {

    if(this.allRooms != null){
      this.allRooms == null
    }
    var usersList = [];
    var user;
    var allRooms = await this.hs.getAllRoomsByUserId(Number(this.hs.loggedInUserId));
    var allRoomsOfLoggedInUser = allRooms["data"];

    for (let i = 0; i < allRoomsOfLoggedInUser.length; i++) {

      var allUserOfRoom = await this.hs.getAllUsersByRoomId(allRoomsOfLoggedInUser[i]["room_id"]);
      var allUsers = allUserOfRoom["data"];

      for (let i = 0; i < allUsers.length; i++) {
        usersList.push(allUsers[i]["user_id"])

        if(allUsers[i]["user_id"] != this.hs.loggedInUserId){
          user = await this.hs.getUserById(Number((allUsers[i]["user_id"])));
        }
      }

      console.log(user);
      var username = user["username"];
      
      //this.allRooms ist die Liste von Rooms, wo alle Rooms vom User eingespeichert sind
      this.allRooms.push(new Room((allRoomsOfLoggedInUser[i]["room_id"]), [], [this.hs.loggedInUsername, username]));
      this.users.push(user);
    }


  }

  public async loadAllUsers() {
    let allUser = await this.hs.getAllUsers();
    console.log(allUser);
    for(let i = 0; i < allUser.length; i++){
      this.allUsersInContactList.push(new ChatUser(Number(allUser[i]["user_id"]), allUser[i]["firstname"] , allUser[i]["lastname"], allUser[i]["username"]));
    }
  }
}






