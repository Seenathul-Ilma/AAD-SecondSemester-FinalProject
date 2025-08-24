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

    @GetMapping("/all/paginated")
    public Page<ClassroomDTO> getPaginatedClassroom(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return classroomService.getClassroomsByPaginated(page, size);
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> saveClassroom(@Valid @RequestBody ClassroomDTO classroomDTO) {
        Classroom savedClassroom = classroomService.saveClassroom(classroomDTO);

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

    @PutMapping("/edit")
    public ResponseEntity<ApiResponse> updateClassroom(@Valid @RequestBody ClassroomDTO classroomDTO) {
        Classroom updatedClassroom = classroomService.updateClassroom(classroomDTO);

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

}
