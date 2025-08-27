package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/27/2025 10:02 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnnouncementDTO {
    private String announcementId;

    private String title;

    private String content;
    private LocalDateTime createdAt;

    private String classroomId;

    private List<String> fileUrls;   // frontend can fetch file
    private List<String> fileTypes;  // helps frontend decide (image / pdf / video)

    private String announcedUserId; // teacher/admin

}

