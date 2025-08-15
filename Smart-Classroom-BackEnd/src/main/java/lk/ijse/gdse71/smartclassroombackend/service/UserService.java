package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import org.springframework.data.domain.Page;

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
    List<UserDTO> getAllUsers();
}
