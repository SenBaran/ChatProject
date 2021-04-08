package at.htl.service;

import at.htl.entity.*;
import at.htl.repository.DBRepository;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/")
public class ChatService {
    @Inject
    DBRepository dbRepository;

    @Path("getUserByUsername/{username}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ChatUser getUserByUsername(@PathParam("username") String username){
        return dbRepository.getUserByUsername(username);
    }

    @Path("addUser")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ChatUser addUser(ChatUser chatUser){
        return dbRepository.addUser(chatUser);
    }

    @Path("deleteUser/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ChatUser deleteUser(@PathParam("id") int id){
        return dbRepository.deleteUser(id);
    }

    @Path("updateUser")
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public ChatUser updateUser(ChatUser chatUser){
        return dbRepository.updateUser(chatUser);
    }

    @Path("getAllUser")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<ChatUser> getAllUser(){
        return dbRepository.findAllUser();
    }

    @Path("addMessage")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Message addMessage(Message message){
        return dbRepository.addMessage(message);
    }

    @Path("deleteMessage/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Message deleteMessage(@PathParam("id") int id){
        return dbRepository.deleteMessage(id);
    }

    @Path("updateMessages")
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Message updateMessage(Message message){
        return dbRepository.updateMessage(message);
    }

    @Path("getMessageById/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public  Message getMessageById(@PathParam("id") int id){
        return dbRepository.findMessageById(id);
    }

    @Path("getAllMessages")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Message> getAllMessages(){
        return dbRepository.findAllMessages();
    }
}