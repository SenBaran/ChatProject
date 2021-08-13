package at.htl.websocket;

import at.htl.entity.ChatUser;
import at.htl.entity.Message;
import at.htl.repository.DBRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.util.JSONWrappedObject;
import io.vertx.core.json.Json;
import org.jose4j.json.internal.json_simple.JSONArray;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/chat/{username}")
@ApplicationScoped
public class Chat{
    @Inject
    DBRepository repository;
    Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {

        sessions.put(username, session);

        //broadcast("User " + username + " joined");
    }

    @OnClose
    public void onClose(Session session, @PathParam("username") String username) {
        sessions.remove(username);
        //broadcast("User " + username + " left the Chat");
    }

    @OnError
    public void onError(Session session, @PathParam("username") String username,Throwable throwable) {
        sessions.remove(username);
    }

    @OnMessage
    public void onMessage(String message, @PathParam("username") String username) throws JsonProcessingException {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        String formatDateTime = LocalDateTime.now().format(formatter);

        var splitted = message.split(";");


        String msg = "["+ formatDateTime + "   ]" + username + ": " + splitted[0];
        Message messageObject = new Message();
        messageObject.setTimestamp(LocalDateTime.now());
        messageObject.setMessage(msg);
        messageObject.setUsername(username);
        //repository.addMessage(messageObject);

        broadcast(messageObject, splitted[1]);
    }

    private void broadcast(Message message, String toUsername) throws JsonProcessingException {


        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
        String json = ow.writeValueAsString(message);
        System.out.println(toUsername);
        sessions.forEach((s, session) -> {
            if(s.equals(toUsername) || s.equals(message.getUsername())){
                session.getAsyncRemote().sendObject(json, result ->  {
                    if (result.getException() != null) {
                        System.out.println("Unable to send message: " + result.getException());
                    }
                });
            }
        });

    }
}
