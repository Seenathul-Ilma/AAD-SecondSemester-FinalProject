package lk.ijse.gdse71.smartclassroombackend.service;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthResponseDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.RegisterDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 6:12 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // Login using Spring Security AuthenticationManager
    public AuthResponseDTO authenticate(AuthDTO authDTO) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authDTO.getEmail(),
                            authDTO.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByEmail(authDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                "Bearer",
                user.getEmail(),
                user.getRole().name()
        );
    }

    // Register new user
    public void register(RegisterDTO registerDTO) {
        Role role = Role.valueOf(registerDTO.getRole().toUpperCase());

        if(role == Role.STUDENT) {
            throw new AccessDeniedException("Students cannot register themselves.");
        }

        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new ResourceDuplicateException("username (email) already exists.");
        }

        User user = User.builder()
                .userId(userService.generateNextUserId(role))
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
    }
}

