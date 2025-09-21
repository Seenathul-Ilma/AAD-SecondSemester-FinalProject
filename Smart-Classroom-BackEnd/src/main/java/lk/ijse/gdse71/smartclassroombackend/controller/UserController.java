package lk.ijse.gdse71.smartclassroombackend.controller;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserSelectionDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','TEACHER', 'STUDENT')")  // Overrides class-level
public class UserController {

    private final UserService userService;

    /*@GetMapping("/students")
    public List<UserDTO> getAllStudents(){
        return userService.getAllStudents();
    }*/

    @GetMapping("/all/{classroomId}/users")
    public ResponseEntity<ApiResponse> getPaginatedUsers(
            //public Page<UserDTO> getPaginatedStudents(
            @PathVariable String classroomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        //return userService.getUsersByPaginated(page, size, Role.STUDENT);
        Page<UserSelectionDTO> userDTOS = userService.getAllUsersByPaginated(classroomId, page, size);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Users paginated successfully..!",
                        userDTOS
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse> getPaginatedStudents(
    //public Page<UserDTO> getPaginatedStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        //return userService.getUsersByPaginated(page, size, Role.STUDENT);
        Page<UserDTO> userDTOS = userService.getUsersByPaginated(page, size, Role.STUDENT);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Students paginated successfully..!",
                        userDTOS
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/getByEmail/{email}")
    public ResponseEntity<UserDTO> getProfile(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<UserDTO> getProfileById(@PathVariable String userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /*@GetMapping("/teachers")
    public List<UserDTO> getAllTeachers(){
        return userService.getAllTeachers();
    }*/

    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse> getPaginatedTeachers(
    //public Page<UserDTO> getPaginatedTeachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Page<UserDTO> userDTOS = userService.getUsersByPaginated(page, size, Role.TEACHER);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Teachers paginated successfully..!",
                        userDTOS
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse> getAllAdmins(){
    //public List<UserDTO> getAllAdmins(){
        List<UserDTO> userDTOS = userService.getAllAdmins();
        //return userService.getAllAdmins();
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Success..!",
                        userDTOS
                )
        );
    }

    @PostMapping("/students/add")
    public ResponseEntity<ApiResponse> saveStudent(@Valid @RequestBody UserDTO userDTO) throws IOException, MessagingException {
    //public boolean saveStudent(@Valid @RequestBody UserDTO userDTO){
        boolean isSaved = userService.saveUser(userDTO, Role.STUDENT);
        if(!isSaved){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to create student..!",
                            isSaved
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }
        //return userService.saveUser(userDTO, Role.STUDENT);
        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Student created successfully..!",
                        isSaved
                ),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/teachers/add")
    public ResponseEntity<ApiResponse> saveTeacher(@Valid @RequestBody UserDTO userDTO) throws IOException, MessagingException {
    //public boolean saveTeacher(@Valid @RequestBody UserDTO userDTO){

        boolean isSaved = userService.saveUser(userDTO, Role.TEACHER);
        if(!isSaved){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to create teacher..!",
                            isSaved
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }
        //return userService.saveUser(userDTO, Role.TEACHER);

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Teacher created successfully..!",
                        isSaved
                ),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/students/edit")
    public ResponseEntity<ApiResponse> updateStudent(@Valid @RequestBody UserDTO userDTO) {
    //public boolean updateStudent(@Valid @RequestBody UserDTO userDTO) {
        boolean isUpdated = userService.updateUser(userDTO, Role.STUDENT);
        if(!isUpdated){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to update student..!",
                            isUpdated
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }
        //return userService.updateUser(userDTO, Role.STUDENT);

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Student updated successfully..!",
                        isUpdated
                ),
                HttpStatus.OK
        );
    }

    @PutMapping(
            value = "/profile/update/{role}/{userId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> updateStudent(@PathVariable String userId,
                                                     @PathVariable Role role,
                                                     @ModelAttribute UserDTO userDTO,
                                                     @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) throws IOException {
        boolean isUpdated = userService.updateProfile(userId, userDTO, profileImage, role);
        if(!isUpdated){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to update user..!",
                            isUpdated
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }
        //return userService.updateUser(userDTO, Role.STUDENT);

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "User updated successfully..!",
                        isUpdated
                ),
                HttpStatus.OK
        );
    }

    @PutMapping("/teachers/edit")
    public ResponseEntity<ApiResponse> updateTeacher(@Valid @RequestBody UserDTO userDTO) {
    //public boolean updateTeacher(@Valid @RequestBody UserDTO userDTO) {
        boolean isUpdated =  userService.updateUser(userDTO, Role.TEACHER);
        if(!isUpdated){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to update teacher..!",
                            isUpdated
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }
        //return userService.updateUser(userDTO, Role.TEACHER);

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Teacher updated successfully..!",
                        isUpdated
                ),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Only users with ROLE_ADMIN can call this
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String id){
    //public boolean deleteUser(@PathVariable String id){

        boolean isDeleted =  userService.deleteUser(id);
        if(!isDeleted){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to delete..!",
                            isDeleted
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }
        //return userService.deleteUser(id);

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Deletion successful..!",
                        isDeleted
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getUserWithoutAuthenticated(@RequestBody UserDTO userDTO) {
        List<UserDTO> userDTOS = userService.getUsersWithoutAuthenticated(userDTO);

        if (userDTOS.isEmpty()){

        }

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Users fetched successfully..!",
                        userDTOS
                )
        );
    }
}
