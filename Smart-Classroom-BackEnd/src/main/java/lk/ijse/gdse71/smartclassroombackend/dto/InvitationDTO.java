package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 8:46 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationDTO {
    private String token;    // unique token for registration
    private String email;       // invited teacher's email
    private String role;        // usually "TEACHER"
    private boolean used;       // whether the invitation has been used
    private LocalDateTime createdAt;
    private LocalDateTime usedAt;
    private LocalDateTime expiryDate; // optional: when the invitation expires
}
