package lk.ijse.gdse71.smartclassroombackend.service;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AuthResponseDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.RegisterDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Invitation;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.InvitationRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
    private final InvitationRepository invitationRepository;
    private final UserService userService;

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // Login using Spring Security AuthenticationManager
    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        // Fetch user from DB
        User user = userRepository.findByEmail(authDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check password manually (since DB stores encoded password)
        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // If match → generate tokens
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

        // Only allow TEACHER registration via invitation
        if (role != Role.TEACHER) {
            throw new AccessDeniedException("Only teachers can register using an invitation.");
        }

        // Check if email already exists
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new ResourceDuplicateException("Email already exists.");
        }

        // Validate invitation token
        Invitation invitation = invitationRepository.findById(registerDTO.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid invitation token."));


        if (!invitation.getEmail().equals(registerDTO.getEmail())) {
            throw new IllegalArgumentException("Invitation email does not match registration email.");
        }

        if (invitation.isUsed()) {
            throw new IllegalStateException("Invitation token has already been used.");
        }

        if (invitation.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Invitation token has expired.");
        }

        // Create teacher user
        User user = User.builder()
                .userId(userService.generateNextUserId(role))
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .name(registerDTO.getName())
                .role(role)
                .build();

        userRepository.save(user);

        // Mark invitation as used
        invitation.setUsed(true);
        invitation.setUsedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }
}

