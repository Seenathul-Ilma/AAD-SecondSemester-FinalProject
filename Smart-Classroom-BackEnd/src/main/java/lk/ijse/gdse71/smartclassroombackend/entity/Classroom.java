package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

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
    @Column(unique = true)
    private String classroomCode;

    @Transient
    private static final String CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Transient
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateRandomClassroomCode() {
        StringBuilder code = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            code.append(CHAR_POOL.charAt(RANDOM.nextInt(CHAR_POOL.length())));
        }
        return code.toString();
    }

    // Uni-directional
    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserClassroom> userClassrooms;     // ok

    //@OneToMany(mappedBy = "classroom")
    //private List<Announcement> announcements;      // ok

    //@OneToMany(mappedBy = "classroom")
    //private List<Assignment> assignments;       // ok

    //@OneToMany(mappedBy = "classroom")
    //private List<Resources> resources;          // ok


}
