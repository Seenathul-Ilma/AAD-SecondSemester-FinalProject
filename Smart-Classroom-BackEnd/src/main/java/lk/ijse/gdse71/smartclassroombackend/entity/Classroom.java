package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
public class Classroom {
    @Id
    @Column(name = "classroom_id")
    private String classroomId;

    private String classLevel;   // Grade 7
    private String subject;
    private String description;
    private String classroomCode;


    // Uni-directional
    //@OneToMany(mappedBy = "classroom")
    //private List<UserClassroom> userClassrooms;     // ok

    //@OneToMany(mappedBy = "classroom")
    //private List<Announcement> announcements;      // ok

    //@OneToMany(mappedBy = "classroom")
    //private List<Assignment> assignments;       // ok

    //@OneToMany(mappedBy = "classroom")
    //private List<Resources> resources;          // ok


}
