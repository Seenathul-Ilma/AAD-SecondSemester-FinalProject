package lk.ijse.gdse71.smartclassroombackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/10/2025 5:38 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    //@Column(name = "message_id")
    //private String messageId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id")
    private User sender;                // ok
    //private String senderId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "receiver_id")
    private User receiver;              // ok
    //private String receiverId;

    //@JoinColumn(name = "conversation_id", nullable = false)  // explicit FK column
    @JsonIgnore
    @ManyToOne(optional = false)
    private Conversation conversation;

    private String content;

    private Boolean isRead = false;

    //private String message;
    //@Column(name = "sentAt")
    @CreationTimestamp
    private LocalDateTime createdAt;

    public Message(User sender, User receiver, Conversation conversation, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.conversation = conversation;
        this.content = content;
        this.isRead = false;
    }

    //private List<Message> messages = new ArrayList<>();
}
