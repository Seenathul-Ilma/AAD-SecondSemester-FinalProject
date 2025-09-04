package lk.ijse.gdse71.smartclassroombackend.service;

import jakarta.mail.MessagingException;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import org.springframework.data.domain.Page;

import java.io.IOException;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/15/2025 6:11 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

public interface UserService {
    List<UserDTO> getAllStudents();

    List<UserDTO> getAllTeachers();

    List<UserDTO> getAllAdmins();

    String generateNextUserId(Role role);

    boolean saveUser(UserDTO userDTO, Role role) throws IOException, MessagingException;

    boolean updateUser(UserDTO userDTO, Role role);

    boolean deleteUser(String id);

    Page<UserDTO> getUsersByPaginated(int page, int size, Role student);

    String generatePassword(int length);

    UserDTO getUserByEmail(String email);
}
