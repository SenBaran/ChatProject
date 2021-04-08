package at.htl.repository;

import at.htl.entity.*;
import at.htl.websocket.Chat;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.transaction.Transactional;
import java.lang.reflect.Member;
import java.util.LinkedList;
import java.util.List;

@ApplicationScoped
public class DBRepository {
    @Inject
    private EntityManager em;

    @Transactional
    public Message addMessage(Message msg){
        return em.merge(msg);
    }

    @Transactional
    public Message deleteMessage(int id){
        var msg = findMessageById(id);
        em.remove(msg);
        return msg;
    }

    @Transactional
    public Message updateMessage(Message msg){
        return em.merge(msg);
    }

    public Message findMessageById(int id){
        var messages = findAllMessages();
        return messages.stream().filter(e -> e.getId() == id).findFirst().orElse(null);
    }

    public List<Message> findAllMessages(){
        return em.createNamedQuery("Message.findAll", Message.class)
                .getResultList();
    }

    @Transactional
    public ChatUser addUser(ChatUser chatUser){
        return em.merge(chatUser);
    }

    @Transactional
    public ChatUser deleteUser(int id){
        var usr = findUserById(id);
        em.remove(usr);
        return usr;
    }

    @Transactional
    public ChatUser updateUser(ChatUser chatUser){
        return em.merge(chatUser);
    }

    public List<ChatUser> findAllUser(){
        return em.createNamedQuery("ChatUser.findAll", ChatUser.class)
                .getResultList();
    }

    public ChatUser getUserByUsername(String username){
        List<ChatUser> chatUserList = findAllUser();
        return chatUserList.stream().filter(e -> e.getUsername().equals(username)).findFirst().orElse(null);
    }

    public ChatUser findUserById(int id){
        var chatUser = findAllUser();
        return chatUser.stream().filter(e -> e.getId() == id).findFirst().orElse(null);
    }
}
