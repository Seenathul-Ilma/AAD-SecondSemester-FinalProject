package lk.ijse.gdse71.smartclassroombackend.dto;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/20/2025 11:46 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionCountDTO {
    private long submittedCount;
    private long lateCount;
    private long notSubmittedCount;
}
