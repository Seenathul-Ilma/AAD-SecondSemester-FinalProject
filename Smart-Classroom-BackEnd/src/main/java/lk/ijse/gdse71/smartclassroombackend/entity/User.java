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
    private String user_id;

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

    @Column(nullable = true)
    private String profile_img;

    @Column(nullable = true)
    private String emergency_contact;

    @Column(nullable = true)
    private String relationship;   // relationship between given emergency contact

}
