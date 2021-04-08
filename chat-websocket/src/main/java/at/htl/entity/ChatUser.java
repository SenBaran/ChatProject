package at.htl.entity;

import javax.persistence.*;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

@Entity
@NamedQuery(name = "ChatUser.findAll", query = "SELECT c FROM ChatUser c")
public class ChatUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String username;

    @ElementCollection
    private Collection<Integer> messageIds;

    public ChatUser() {
    }

    public ChatUser(Integer id, String username, String password, Collection<Integer> roomIds, Collection<Integer> messageIds) {
        this.id = id;
        this.username = username;
        this.messageIds = messageIds;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Collection<Integer> getMessageIds() {
        return messageIds;
    }

    public void setMessageIds(Collection<Integer> messageIds) {
        this.messageIds = messageIds;
    }
}
