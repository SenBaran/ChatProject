package at.htl.websocket;

import at.htl.entity.ChatUser;
import at.htl.entity.Message;
import at.htl.repository.DBRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/chat/{username}")
@ApplicationScoped
public class Chat{
    @Inject
    DBRepository repository;
    Map<String , Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        var chatUser = repository.getUserByUsername(username);
        sessions.put(username, session);


        broadcast("User " + username + " joined");

    }

    @OnClose
    public void onClose(Session session, @PathParam("username") String username) {
        var chatUser = repository.getUserByUsername(username);
        sessions.remove(username);
        broadcast("User " + username + " left the Chat");
    }

    @OnError
    public void onError(Session session, @PathParam("username") String username,Throwable throwable) {
        var chatUser = repository.getUserByUsername(username);
        sessions.remove(username);
    }

    @OnMessage
    public void onMessage(String message, @PathParam("username") String username) {
        var chatUser = repository.getUserByUsername(username);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        String formatDateTime = LocalDateTime.now().format(formatter);
        Message messageObject = new Message();
        messageObject.setTimestamp(LocalDateTime.now());
        messageObject.setMessage(message);
        messageObject.setUsername(username);
        repository.addMessage(messageObject);
        broadcast("["+ formatDateTime + " ]" + username + ": " + message);
    }

    private void broadcast(String message) {

        sessions.values().forEach(s -> {
            s.getAsyncRemote().sendObject(message, result ->  {
                if (result.getException() != null) {
                    System.out.println("Unable to send message: " + result.getException());
                }
            });
        });
    }
}
