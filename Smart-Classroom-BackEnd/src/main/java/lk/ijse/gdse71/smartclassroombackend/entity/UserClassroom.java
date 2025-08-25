package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class UserClassroom {
    @Id
    @Column(name = "user_classroom_id")
    private String userClassroomId;

    @Enumerated(EnumType.STRING)
    private ClassroomRole roleInClassroom;        // TEACHER, STUDENT

    private boolean isCreator;      // true = teacher who created class

    private LocalDateTime joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;                  // ok
    //private String user;               // teacher or student

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;            // ok

    // Uni-directional
    //@OneToMany(mappedBy = "userClassroom")
    //private List<Payment> payment;          // ok

}
