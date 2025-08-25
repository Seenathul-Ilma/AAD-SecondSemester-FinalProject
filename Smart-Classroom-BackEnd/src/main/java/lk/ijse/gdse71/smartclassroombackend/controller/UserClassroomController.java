package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.service.UserClassroomService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/24/2025 8:54 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classroom")
@RequiredArgsConstructor
public class UserClassroomController {

    private final UserClassroomService userClassroomService;

    @PostMapping("/join")
    public ResponseEntity<ApiResponse> joinClassroomByCode(@RequestParam String studentId, @RequestParam String classroomCode){
        UserClassroomDTO joinedClassroom = userClassroomService.joinClassroomByCode(studentId, classroomCode);

        if (joinedClassroom == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse(
                            400,
                            "Failed to join classroom. Invalid studentId or classroomCode.",
                            null
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse(
                        201,
                        "Joined classroom successfully!",
                        joinedClassroom
                )
        );
    }

    @PostMapping("/join/list")
    public ResponseEntity<ApiResponse> joinListOfMembersToClassroomByCode(@RequestBody Set<String> studentIds, @RequestParam String classroomCode){

        List<UserClassroomDTO> joinedStudents = userClassroomService.joinListOfMembersToClassroomByCode(studentIds, classroomCode);

        if (joinedStudents == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiResponse(
                            400,
                            "Failed to join classroom. Invalid studentId or classroomCode.",
                            null
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse(
                        201,
                        "Joined classroom successfully!",
                        joinedStudents
                )
        );
    }

}
