package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.*;

import java.time.LocalDateTime;

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
public class MessageDTO {
    private Long id;
    private String content;
    private Boolean isRead;
    private LocalDateTime sentAt;

    private UserDTO sender;
    private UserDTO receiver;
}
