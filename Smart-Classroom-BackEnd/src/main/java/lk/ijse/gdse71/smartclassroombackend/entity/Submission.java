package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    //@Column(name = "submission_id")
    //@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "submission_id")
    private String submissionId;

    private LocalDateTime submissionDate;

    //private String content;     // filepath

    @Lob
    @Column(name = "file_urls", columnDefinition = "TEXT")
    private String fileUrls;     // file url

    @Lob
    @Column(name = "file_types")
    private String fileTypes;

    @Column(name = "status", nullable = true)
    private String status;              // SUBMITTED, LATE, NOT_SUBMITTED

    //@Column(name = "marks", nullable = true)
    //private Double marks;

    //@Column(name = "grade", nullable = true)
    //private Character grade;

    @ManyToOne
    @JoinColumn(name = "submitted_by")
    private User user;                      // ok
    //private String studentId;         // userId

    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;          // ok
    //private String assignmentId;
}
