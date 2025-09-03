package lk.ijse.gdse71.smartclassroombackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 8:41 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Entity
@Table(name = "invitations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    @Column(name = "token", nullable = false, unique = true, updatable = false)
    private String token;

    //@Column(name = "email", nullable = false, unique = true)
    @Column(name = "email", nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role; // TEACHER

    @Column(name = "used", nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    // Factory method
    public static Invitation create(String email, Role role, LocalDateTime expiryDate) {
        return Invitation.builder()
                .token(UUID.randomUUID().toString())
                .email(email)
                .role(role)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiryDate(expiryDate)
                .build();
    }
}
