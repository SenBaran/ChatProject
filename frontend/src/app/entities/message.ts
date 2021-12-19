export class Message {
    public message : string
    public username : string
    public timestamp : string

    constructor(message : string,username : string, timestamp : string)
    {
        this.message = message;
        this.username = username;
        this.timestamp = timestamp;
    }
}
