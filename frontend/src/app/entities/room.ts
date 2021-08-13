import { TOUCH_BUFFER_MS } from "@angular/cdk/a11y";

export class Room {
    public roomId : Number;
    public chat = [];
    public roomUsers = [];

    constructor(roomId : Number, chat : String[] , roomUser: String[]){
        this.roomId = roomId;
        this.chat = chat;
        this.roomUsers = roomUser;
    }
}
