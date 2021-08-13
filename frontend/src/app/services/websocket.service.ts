import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private websocket : WebSocket;
  private url = "ws://localhost:9000/chat/";
  
  @Output() chatUpdated = new EventEmitter<string>();
  @Output() usersUpdated = new EventEmitter<string>();
  @Output() connected = new EventEmitter<boolean>();
  toSendMessage : string = "";

  public ngopenWebSocket(username : string){
    this.websocket = new WebSocket(this.url + username);

    this.websocket.onopen = (event) => this.connected.emit(true);
    this.websocket.onclose = (event) => this.connected.emit(false);
    this.websocket.onerror = (event) => this.connected.emit(false);
    this.websocket.onmessage = (event) =>{
      this.chatUpdated.emit(event.data);
    } 


  }

  public sendMessage(msg : string, toUsername : string) : void{
    
    this.toSendMessage = msg + ";" + toUsername;
    this.websocket.send(this.toSendMessage);
  }

  public closeWebSocket() : void{
    this.websocket.close();
  }
}
