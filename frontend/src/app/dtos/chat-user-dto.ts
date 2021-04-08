export class ChatUserDto {
    constructor(
        public id : number = 0,
        public username : string,
        public messageIds : number[],
    ){}
}
