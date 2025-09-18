package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class MessageDTO {
    private String receiverId;
    private String content;
    private LocalDateTime createdAt;
    private String senderId;
}
