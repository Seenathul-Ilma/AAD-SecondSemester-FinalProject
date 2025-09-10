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

    @ManyToOne
    @JoinColumn(name = "sender_id",  nullable = false)
    private User sender;                // ok
    //private String senderId;

    @ManyToOne
    @JoinColumn(name = "receiver_id",  nullable = false)
    private User receiver;              // ok
    //private String receiverId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)  // explicit FK column
    private Conversation conversation;

    private String content;

    private Boolean isRead = false;

    //private String message;
    @CreationTimestamp
    @Column(name = "sentAt")
    private LocalDateTime sentAt;

    //private List<Message> messages = new ArrayList<>();
}
