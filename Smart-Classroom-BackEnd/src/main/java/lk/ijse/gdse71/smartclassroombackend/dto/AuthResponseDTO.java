package lk.ijse.gdse71.smartclassroombackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 5:52 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AuthResponseDTO {

    private String accessToken;

    private String refreshToken;

    private String tokenType = "Bearer";

    private String username; // optional: user info

    private String role;     // optional: role-based access

    private String userId;

}
