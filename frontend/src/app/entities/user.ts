import { Message } from "./message";

export class ChatUser {
    constructor(
        public id : number = 0,
        public username : string,
        public messages : Message[] = [],
    ){}
}