package lk.ijse.gdse71.smartclassroombackend.controller;

import jakarta.validation.Valid;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.ClassroomService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/23/2025 9:57 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classroom")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllClassrooms(){
        List<ClassroomDTO> classroomDTOS = classroomService.getAllClassrooms();
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Success..!",
                        classroomDTOS
                )
        );
    }

    @GetMapping("/all/paginated")
    public ResponseEntity<ApiResponse> getPaginatedClassroom(
    //public Page<ClassroomDTO> getPaginatedClassroom(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        Page<ClassroomDTO> classroomDTOS = classroomService.getClassroomsByPaginated(page, size);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Classrooms paginated successfully..!",
                        classroomDTOS
                ),
                HttpStatus.OK
        );
        //return classroomService.getClassroomsByPaginated(page, size);
    }

    @GetMapping("/id/{classroomId}")
    public ResponseEntity<ApiResponse> getClassroomById(@PathVariable String classroomId){
        ClassroomDTO foundClassroom = classroomService.getClassroomById(classroomId);

        if (foundClassroom == null) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to find classroom..!",
                            null
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Classroom found..!",
                        foundClassroom
                ),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse> getClassroomsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String userId,
            @RequestParam Role role
    ) {
        Page<ClassroomDTO> classrooms = classroomService.getClassroomsByRole(userId, role, page, size);

        return ResponseEntity.ok(
                new ApiResponse(200, "Classrooms fetched successfully", classrooms)
        );
    }

    @GetMapping("/code/{classroomCode}")
    public ResponseEntity<ApiResponse> getClassroomByCode(@PathVariable String classroomCode){
        ClassroomDTO foundClassroom = classroomService.getClassroomByCode(classroomCode);

        if (foundClassroom == null) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to find classroom..!",
                            null
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Classroom found..!",
                        foundClassroom
                ),
                HttpStatus.CREATED
        );

    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> saveClassroom(@Valid @RequestBody ClassroomDTO classroomDTO, @RequestParam String creatingUserId) {
        ClassroomDTO savedClassroom = classroomService.saveClassroom(classroomDTO, creatingUserId);

        if (savedClassroom == null) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to create classroom..!",
                            null
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Classroom created successfully..!",
                        savedClassroom
                ),
                HttpStatus.CREATED
        );
    }

    /*@PutMapping("/edit")
    public ResponseEntity<ApiResponse> updateClassroom(@Valid @RequestBody ClassroomDTO classroomDTO, @RequestParam String updatingTeacherId) {
        ClassroomDTO updatedClassroom = classroomService.updateClassroom(classroomDTO, updatingTeacherId);

        if (updatedClassroom == null) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to update classroom..!",
                            null
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Classroom updated successfully..!",
                        updatedClassroom
                ),
                HttpStatus.OK
        );
    }
*/

    @PutMapping("/edit/{classroomId}")
    public ResponseEntity<ApiResponse> updateClassroom(
            @PathVariable String classroomId,
            @Valid @RequestBody ClassroomDTO classroomDTO,
            @RequestParam String updatingTeacherId) {

        classroomDTO.setClassroomId(classroomId);
        ClassroomDTO updatedClassroom = classroomService.updateClassroom(classroomDTO, updatingTeacherId);

        if (updatedClassroom == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(400, "Failed to update classroom..!", null));
        }

        return ResponseEntity
                .ok(new ApiResponse(200, "Classroom updated successfully..!", updatedClassroom));
    }


    @DeleteMapping("/delete/{classroomId}")
    public ResponseEntity<ApiResponse> deleteClassroom(@PathVariable String classroomId, @RequestParam String deletingTeacherId){

        boolean isDeleted =  classroomService.deleteClassroom(classroomId, deletingTeacherId);
        if(!isDeleted){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to delete classroom..!",
                            isDeleted
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Deletion successful..!",
                        isDeleted
                ),
                HttpStatus.OK
        );
    }

}
