package lk.ijse.gdse71.smartclassroombackend.dto;

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

    private String classLevel;   // Grade 7
    private String subject;
    private String description;
    private String classroomCode;
}
