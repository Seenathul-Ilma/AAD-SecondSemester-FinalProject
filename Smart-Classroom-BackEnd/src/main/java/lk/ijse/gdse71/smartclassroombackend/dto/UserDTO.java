package lk.ijse.gdse71.smartclassroombackend.dto;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/15/2025 3:25 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserDTO {

    @NotBlank(message = "User ID cannot be blank")
    private String user_id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;

    @NotBlank(message = "Contact is required")
    @Pattern(regexp = "^(?:\\+94|0)?[0-9]{9,10}$", message = "Contact must be a valid phone number")
    private String contact;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "STUDENT|TEACHER|ADMIN", message = "Role must be STUDENT, TEACHER or ADMIN")
    private String role;

    @Pattern(regexp = "([^\\s]+(\\.(?i)(jpg|jpeg|png))$)", message = "Profile image must be a valid image file (jpg, jpeg, png)")
    private String profile_img; // optional, can be null

    // Only for students, nullable for others
    @Pattern(regexp = "^(?:\\+94|0)?[0-9]{9,10}$")
    @Size(max = 50, message = "Emergency contact name cannot exceed 50 characters")
    private String emergency_contact;

    @Size(max = 50, message = "Relationship description cannot exceed 50 characters")
    private String relationship;   // relationship between given emergency contact

}

