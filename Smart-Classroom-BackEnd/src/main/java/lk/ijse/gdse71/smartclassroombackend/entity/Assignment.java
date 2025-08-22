package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "assignment")
public class Assignment {
    @Id
    @Column(name = "assignment_id")
    private String assignmentId;

    private String title;

    private String description;

    private LocalDate assignedDate;

    private LocalDate dueDate;

    private String teacher;     // userId

    private String classroom;   // classroomId
}
