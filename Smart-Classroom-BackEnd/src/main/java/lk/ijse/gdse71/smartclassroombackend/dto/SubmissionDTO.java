package lk.ijse.gdse71.smartclassroombackend.dto;

import jakarta.persistence.*;
import lk.ijse.gdse71.smartclassroombackend.entity.Assignment;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/19/2025 8:07 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@AllArgsConstructor
@NoArgsConstructor
@Data
public class SubmissionDTO {

    private String submissionId;

    private LocalDateTime submissionDate;

    //private String content;     // filepath
    private List<String> fileUrls;   // frontend can fetch file

    private List<String> fileTypes;  // helps frontend decide (image / pdf / video)

    private String status;              // SUBMITTED, LATE, NOT_SUBMITTED

    //private Double marks;

    //private Character grade;

    private String studentId;         // submitted userId
    private String studentName;

    private String assignmentId;

}
