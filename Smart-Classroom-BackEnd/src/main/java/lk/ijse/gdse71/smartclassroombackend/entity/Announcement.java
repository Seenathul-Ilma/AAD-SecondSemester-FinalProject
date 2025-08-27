package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
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

// Done

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

    // Optional file attachment (store path or URL, not the actual file!)
    private String fileUrl;     // "/uploads/announcements/abc.pdf"
    private String fileType;    // "image/png", "video/mp4", "application/pdf"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;                  // ok
    //private String teacher;    //  or admin   - userId

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;           // ok
    //private String classroomId;

}
