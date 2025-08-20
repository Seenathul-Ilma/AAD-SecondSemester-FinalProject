package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/15/2025 4:07 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin(origins = "http://localhost:5173") // allow only your frontend
@RestController
@RequestMapping("/api/v1/edusphere")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/students")
    public List<UserDTO> getAllStudents(){
        return userService.getAllStudents();
    }

    @GetMapping("/teachers")
    public List<UserDTO> getAllTeachers(){
        return userService.getAllTeachers();
    }

    @GetMapping("/admins")
    public List<UserDTO> getAllAdmins(){
        return userService.getAllAdmins();
    }

    @PostMapping("/students/add")
    public boolean saveStudent(@RequestBody UserDTO userDTO){
        String newId = userService.generateNextStudentId();
        userDTO.setUserId(newId);

        String password = "abcd1234";

        userDTO.setPassword(password);
        userDTO.setRole(String.valueOf(Role.STUDENT));

        return userService.saveUser(userDTO);
    }

    @PostMapping("/teachers/add")
    public boolean saveTeacher(@RequestBody UserDTO userDTO){
        String newId = userService.generateNextTeacherId();
        userDTO.setUserId(newId);

        String password = "teach1234";

        userDTO.setPassword(password);
        userDTO.setRole(String.valueOf(Role.TEACHER));

        return userService.saveUser(userDTO);
    }
}
