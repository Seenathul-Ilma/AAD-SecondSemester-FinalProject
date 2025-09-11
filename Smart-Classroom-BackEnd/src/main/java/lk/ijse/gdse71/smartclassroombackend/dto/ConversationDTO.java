package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.*;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/10/2025 6:02 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDTO {
    private Long id;
    //private LocalDateTime createdAt;

    //private UserDTO sender;
    private String senderId;
    //private UserDTO receiver;
    private String receiverId;

    private List<MessageDTO> messages;
}