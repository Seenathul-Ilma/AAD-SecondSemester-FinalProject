package lk.ijse.gdse71.smartclassroombackend.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.nio.channels.FileChannel;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/15/2025 6:02 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    List<User> findAllByRole(Role role);

    User findTopByRoleOrderByUserIdDesc(Role role);

    Page<User> findAllByRole(Role role, Pageable pageable);

    Optional<User> findUserByUserIdAndRole(String id, Role role);

    Optional<User> findByEmail(String email);

    Optional<User> findByRole(Role role);

    boolean existsByEmail(@NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email);

    boolean existsByEmailAndUserIdNot(@NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email, String userId);

    Optional<User> findUserByUserIdAndRoleIn(String userId, List<Role> roles);

    List<User> findAllByUserIdNot(String userId);
}
