package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/22/2025 1:15 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Submission {

    @Id
    @Column(name = "submission_id")
    private String submissionId;

    private LocalDate submissionDate;
    private String content;             // filepath
    private String status;              // SUBMITTED, LATE, NOT_SUBMITTED
    private Double marks;
    private Character grade;

    private String studentId;           // userId
    private String assignmentId;
}
