package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
public class Chat {
    @Id
    @Column(name = "message_id")
    private String messageId;

    private String content;
    private LocalDateTime sentAt;

    private String senderId;
    private String receiverId;
}
