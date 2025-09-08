package lk.ijse.gdse71.smartclassroombackend.dto;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/7/2025 11:13 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CommentDTO {
    private Long commentId;
    private String announcementId;
    private String commenterId;
    private String commenterName;
    private String content;
    private LocalDateTime createdAt;
}
