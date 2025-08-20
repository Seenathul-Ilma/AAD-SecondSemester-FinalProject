package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/15/2025 3:15 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data           // Includes @Getter, @Setter, @ToString
@Entity
public class User {
    @Id
    @Column(name = "user_id")   // maps to DB column
    private String userId;

    @Column
    private String name;

    @Column
    private String address;

    @Column
    private String contact;

    @Column
    private String email;

    @Column
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "profile_img", nullable = true)
    private String profileImg;

    @Column(name = "emergency_contact", nullable = true)
    private String emergencyContact;

    @Column(nullable = true)
    private String relationship;   // relationship between given emergency contact

}
