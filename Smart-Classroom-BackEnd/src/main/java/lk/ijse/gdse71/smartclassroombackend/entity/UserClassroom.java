package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
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
public class UserClassroom {
    @Id
    @Column(name = "user_classroom_id")
    private String userClassroomId;

    private String roleInClassroom;
    private String user;                    // teacher or student

    @OneToMany(mappedBy = "userClassroom")
    private List<Payment> payments;

}
