package lk.ijse.gdse71.smartclassroombackend.initializer;

import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 8:35 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Read admin credentials from application.properties or environment variables
    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Check if an admin already exists
        if (userRepository.findByRole(Role.ADMIN).isEmpty()) {
            // Create the initial admin
            User admin = User.builder()
                    .userId("ADM20250001") // you can generate dynamically if needed
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            System.out.println("Initial admin created from env/config!");
        } else {
            System.out.println("Admin already exists, skipping creation.");
        }
    }
}