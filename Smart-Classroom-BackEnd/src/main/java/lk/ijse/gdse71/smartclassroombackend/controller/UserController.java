package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        return userService.saveUser(userDTO, Role.STUDENT);
    }

    @PostMapping("/teachers/add")
    public boolean saveTeacher(@RequestBody UserDTO userDTO){
        return userService.saveUser(userDTO, Role.TEACHER);
    }

    @PutMapping("/students/edit")
    public boolean updateStudent(@RequestBody UserDTO userDTO) {
        return userService.updateUser(userDTO, Role.STUDENT);
    }

    @PutMapping("/teachers/edit")
    public boolean updateTeacher(@RequestBody UserDTO userDTO) {
        return userService.updateUser(userDTO, Role.TEACHER);
    }

    @DeleteMapping("/delete/{id}")
    public boolean deleteUser(@PathVariable String id){
        return userService.deleteUser(id);
    }

}
