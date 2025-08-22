package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

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
@Getter
@Setter
@Entity
@Table(name = "announcement")
public class Announcement {
    @Id
    @Column(name = "announcement_id")
    private String announcementId;
    private String title;
    private String content;

    private String teacher;    //  or admin   - userId
    private String classroomId;

}
