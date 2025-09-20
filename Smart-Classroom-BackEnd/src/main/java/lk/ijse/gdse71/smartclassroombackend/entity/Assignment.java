package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

// Done

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "assignment")
public class Assignment {
    @Id
    @Column(name = "assignment_id")
    private String assignmentId;

    //private String title;

    private String description;

    private LocalDateTime assignedDate;

    private LocalDateTime updatedAt;

    private LocalDateTime dueDate;

    @Lob
    @Column(name = "file_urls", columnDefinition = "TEXT")
    private String fileUrls;     // file url

    @Lob
    @Column(name = "file_types")
    private String fileTypes;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssignmentComment> comments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User user;                              // ok
    //private String teacher;     // userId

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_classroom_id")
    private Classroom classroom;                    // ok
    //private String classroom;   // classroomId

    // Uni-directional
    @OneToMany(mappedBy = "assignment")
    private List<Submission> submissions;        // ok
}
