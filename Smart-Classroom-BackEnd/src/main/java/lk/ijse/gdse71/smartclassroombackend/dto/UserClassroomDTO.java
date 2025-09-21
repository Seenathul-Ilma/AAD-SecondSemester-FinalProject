package lk.ijse.gdse71.smartclassroombackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/24/2025 8:55 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserClassroomDTO {

    private String userClassroomId;

    //@NotBlank(message = "User ID cannot be empty")
    private String memberId;       // instead of full User object
    private String name;
    private String email;
    private String contact;
    private String profileImg;


    @NotBlank(message = "Classroom ID cannot be empty")
    private String classroomId;                     // instead of full Classroom object

    @Pattern(regexp = "STUDENT|TEACHER", message = "Role must be STUDENT, TEACHER")
    private String roleInClassroom;                 // TEACHER / STUDENT

    //@NotNull(message = "Creator flag must be specified")
    private Boolean creator;                        // true = teacher created

    @NotNull(message = "JoinedAt cannot be null")
    private LocalDateTime joinedAt;
}
