package lk.ijse.gdse71.smartclassroombackend.controller;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthResponseDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.RegisterDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.AuthService;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lk.ijse.gdse71.smartclassroombackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

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
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

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

        // Check if email already exists
        if (authService.existsByEmail(dto.getEmail())) {   // method in your AuthService
            return new ResponseEntity<>(
                    new ApiResponse(409, "Email already registered: " + dto.getEmail(), null),
                    HttpStatus.CONFLICT
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

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return new ResponseEntity<>(
                    new ApiResponse(401, "Invalid or expired refresh token", null),
                    HttpStatus.UNAUTHORIZED
            );
        }

        String username = jwtUtil.extractUsername(refreshToken);

        String newAccessToken = jwtUtil.generateAccessToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username); // optional (rotate)

        AuthResponseDTO responseDTO = new AuthResponseDTO(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                username,
                userRepository.findByEmail(username).get().getRole().name(),
                userRepository.findByEmail(username).get().getUserId()
        );

        return ResponseEntity.ok(new ApiResponse(200, "Token refreshed successfully", responseDTO));
    }


    /*@PostMapping("/login-cookie")
    public ResponseEntity<ApiResponse> loginCookie(@RequestBody AuthDTO authDTO) {
        AuthResponseDTO authResponse = authService.authenticate(authDTO);

        // Create Access Token cookie (short-lived, e.g. 15 min)
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", authResponse.getAccessToken())
                .httpOnly(true)       // prevent JS access
                .secure(true)         // HTTPS only
                .sameSite("Strict")   // protect from CSRF
                .path("/")
                .maxAge(60 * 15)      // 15 minutes
                .build();

        // Create Refresh Token cookie (long-lived, e.g. 7 days)
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(60 * 60 * 24 * 7) // 7 days
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new ApiResponse(200, "User logged in successfully", null));
    }


    @PostMapping("/refresh-token-cookie")
    public ResponseEntity<ApiResponse> refreshTokenCookie(HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("refreshToken")) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return new ResponseEntity<>(
                    new ApiResponse(401, "Invalid or expired refresh token", null),
                    HttpStatus.UNAUTHORIZED
            );
        }

        String username = jwtUtil.extractUsername(refreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username); // rotate if needed

        // Update cookies
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(60 * 15)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(60 * 60 * 24 * 7)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new ApiResponse(200, "Token refreshed successfully", null));
    }
*/


}

