package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
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
 * Created: 8/22/2025 1:14 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Resources {

    @Id
    @Column(name = "resource_id")
    private String resourceId;

    private String title;
    private String filePath;
    private LocalDate uploadedAt;

    @ManyToOne
    @JoinColumn(name = "shared_by")
    private User user;                  // ok
    //private String teacher;    // userId

    @ManyToOne
    @JoinColumn(name = "shared_to")
    private Classroom classroom;        // ok
    //private String classroom;


}
