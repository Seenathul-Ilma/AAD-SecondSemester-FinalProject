package lk.ijse.gdse71.smartclassroombackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/23/2025 9:57 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ClassroomDTO {

    private String classroomId;

    @NotBlank(message = "Class-level is required")
    @Size(min = 2, max = 50, message = "Class-level must be between 2 and 50 characters")
    private String classLevel;   // Grade 7

    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 50, message = "Subject must be between 2 and 50 characters")
    private String subject;

    @Size(max = 200, message = "Description can be at most 200 characters")
    private String description;

    private String classroomCode;

    private String creatorId;  // ID of the teacher who created the classroom

}
