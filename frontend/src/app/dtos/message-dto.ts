export class MessageDto {
    constructor(
        public id : number,
        public timestamp : Date,
        public message : string,
        public chatUserId : number,
        public username : string
    ){}
}
