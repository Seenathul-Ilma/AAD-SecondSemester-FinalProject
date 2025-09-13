package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/29/2025 9:48 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classrooms")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/{classroomId}/view/assignments")
    public ResponseEntity<ApiResponse> getAnnouncements(
            @PathVariable String classroomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<AssignmentDTO> assignmentDTOS = assignmentService.getAssignmentsByClassroomId(classroomId, page, size);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Assignments paginated successfully..!",
                        assignmentDTOS
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/view/assignments")
    public ResponseEntity<ApiResponse> getAllResources(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<AssignmentDTO> assignmentDTOS = assignmentService.getAllAssignments(page, size);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Assignments paginated successfully..!",
                        assignmentDTOS
                ),
                HttpStatus.OK
        );
    }

    @PostMapping(
            value = "/{classroomId}/assignments/{userId}/assign",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> createAssignment(
            @PathVariable String classroomId,
            @PathVariable String userId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("content") String content,
            @RequestParam("dueDate") LocalDateTime dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {

        try {
            AssignmentDTO savedAssignment = assignmentService.createAssignmentByClassroomId(classroomId, userId, title, content, file, dueDate);

            return new ResponseEntity<>(
                    new ApiResponse(
                            201,
                            "Assignment created successfully!",
                            savedAssignment
                    ),
                    HttpStatus.CREATED
            );
        } catch (IOException e) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            500,
                            "File upload failed: " + e.getMessage(),
                            null
                    ),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @PutMapping(
            value = "/{userId}/assignments/{assignmentId}/update",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> updateAssignment(
            @PathVariable String assignmentId,
            @PathVariable String userId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("content") String content,
            @RequestParam("dueDate") LocalDateTime dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {

        try {
            AssignmentDTO savedAssignment = assignmentService.updateAssignmentByAssignmentId(assignmentId, userId, title, content, file, dueDate);

            return new ResponseEntity<>(
                    new ApiResponse(
                            201,
                            "Assignment updated successfully!",
                            savedAssignment
                    ),
                    HttpStatus.CREATED
            );
        } catch (IOException e) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            500,
                            "File upload failed: " + e.getMessage(),
                            null
                    ),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @DeleteMapping("/delete/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse> deleteAssignmentByAssignmentId(@PathVariable String assignmentId, @RequestParam String deletingUserId) {

        boolean isDeleted = assignmentService.deleteAssignment(assignmentId, deletingUserId);
        if (!isDeleted) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to delete assignment..!",
                            isDeleted
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Assignment deleted successfully..!",
                        isDeleted
                ),
                HttpStatus.OK
        );
    }

}
