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
 * Created: 9/2/2025 6:26 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthDTO {
    private String username;  // this will hold the email
    private String email;
    private String password;
}
