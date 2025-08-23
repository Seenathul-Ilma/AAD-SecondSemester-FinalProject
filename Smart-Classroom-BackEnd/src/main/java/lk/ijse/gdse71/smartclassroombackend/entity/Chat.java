package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
@Table(name = "message")
public class Chat {
    @Id
    @Column(name = "message_id")
    private String messageId;

    private String message;
    private LocalDateTime sentAt;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;                // ok
    //private String senderId;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;              // ok
    //private String receiverId;

}
