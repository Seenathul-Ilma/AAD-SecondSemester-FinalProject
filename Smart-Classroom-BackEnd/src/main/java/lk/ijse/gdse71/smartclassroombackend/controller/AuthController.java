package lk.ijse.gdse71.smartclassroombackend.controller;

import jakarta.mail.MessagingException;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthResponseDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.RegisterDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.AuthService;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lk.ijse.gdse71.smartclassroombackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 5:50 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // or whatever your frontend port is
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterDTO dto) throws IOException, MessagingException {
        Role role;
        try {
            role = Role.valueOf(dto.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(
                    new ApiResponse(400, "Invalid role: " + dto.getRole(), null),
                    HttpStatus.BAD_REQUEST
            );
        }

        // Deny students self-registration
        if (role == Role.STUDENT) {
            return new ResponseEntity<>(
                    new ApiResponse(403, "Students cannot register themselves", null),
                    HttpStatus.FORBIDDEN
            );
        }

        authService.register(dto);

        return new ResponseEntity<>(
                new ApiResponse(201, role.name() + " registered successfully!", null),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(
                new ApiResponse(200, "User logged in successfully", authService.authenticate(authDTO))
        );
    }
}

