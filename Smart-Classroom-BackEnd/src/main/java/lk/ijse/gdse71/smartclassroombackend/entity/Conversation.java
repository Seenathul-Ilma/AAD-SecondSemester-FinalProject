package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/22/2025 1:14 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

// Done

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "conversation")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    //@Column(name = "message_id")
    //private String messageId;

    //private String message;

    // * A conversation is just a container for messages between two users.
    // * It doesn’t really have a sentAt — because messages inside it already carry timestamps.
    //private LocalDateTime createdAt = LocalDateTime.now();

    // One user starts the conversation (sender)
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;                // ok
    //private String senderId;

    // Another user receives the conversation
    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;              // ok
    //private String receiverId;

    // One conversation contains many messages
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

}
