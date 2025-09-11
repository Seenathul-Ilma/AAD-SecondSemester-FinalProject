package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class MessageDTO {
    private String receiverId;
    private String content;

    private String senderId;
}
