import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private websocket : WebSocket;
  private url = "ws://localhost:9000/chat/";
  @Output() chatUpdated = new EventEmitter<string>();
  @Output() connected = new EventEmitter<boolean>();

  public openWebSocket(username : string){
    this.websocket = new WebSocket(this.url + username);

    this.websocket.onopen = (event) => this.connected.emit(true);
    this.websocket.onclose = (event) => this.connected.emit(false);
    this.websocket.onerror = (event) => this.connected.emit(false);
    this.websocket.onmessage = (event) =>{
      console.log(event.data);
      this.chatUpdated.emit(event.data);


    } 
  }

  public sendMessage(msg : string) : void{
    this.websocket.send(msg);
  }

  public closeWebSocket() : void{
    this.websocket.close();
  }
}
