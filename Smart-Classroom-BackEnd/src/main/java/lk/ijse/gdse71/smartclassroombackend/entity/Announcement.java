package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Optional file attachment (store path or URL, not the actual file!)
    @Lob
    @Column(name = "file_urls")
    private String fileUrls;    // CLS2025001_TEA20250001_15_1
    //private List<String> fileUrls;    // CLS2025001_TEA20250001_15_1
    //private String fileUrl;

    @Lob
    @Column(name = "file_types")
    private String fileTypes;   // img/png, video/mp4, application/pdf
    //private List<String> fileTypes;   // img/png, video/mp4, application/pdf
    //private String fileType;

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;                  // ok
    //private String teacher;    //  or admin   - userId

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;           // ok
    //private String classroomId;

}
