package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionCountDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.AssignmentStatus;
import lk.ijse.gdse71.smartclassroombackend.service.SubmissionService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
 * Created: 9/19/2025 8:32 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/assignments/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/view/{assignmentId}/{submitStatus}")
    public ResponseEntity<ApiResponse> getSubmissionsByStatusAndAnnouncementId(
            @PathVariable String assignmentId,
            @PathVariable AssignmentStatus submitStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<SubmissionDTO> submissionDTOS = submissionService.getAllSubmissionsByStatusAnnouncementId(assignmentId, submitStatus, page, size);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Submissions paginated successfully..!",
                        submissionDTOS
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/counts/{assignmentId}")
    public ResponseEntity<ApiResponse> getSubmissionCounts(@PathVariable String assignmentId) {
        SubmissionCountDTO counts = submissionService.getSubmissionCounts(assignmentId);

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Submission counts retrieved successfully..!",
                        counts
                ),
                HttpStatus.OK
        );
    }


    @GetMapping("/{submissionId}")
    public ResponseEntity<ApiResponse> getUserSubmissionByAssignmentId(@PathVariable String submissionId){
        SubmissionDTO foundSubmissionDTO = submissionService.getSubmissionBySubmissionId(submissionId);

        if (foundSubmissionDTO == null) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to find submission..!",
                            null
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Announcement found..!",
                        foundSubmissionDTO
                ),
                HttpStatus.OK
        );
    }

    @GetMapping("/{assignmentId}/{userId}/submission")
    public ResponseEntity<ApiResponse> getSubmissionByUserAndAssignment(
            @PathVariable String assignmentId,
            @PathVariable String userId) {

        SubmissionDTO submissionDTO = submissionService.getSubmissionByUserIdAndAssignmentId(userId, assignmentId);

        if (submissionDTO == null) {
            return ResponseEntity.ok(
                    new ApiResponse(200, "User didn't submit to that assignment yet..!", null)
            );
        }

        return ResponseEntity.ok(
                new ApiResponse(200, "Submission fetched successfully", submissionDTO)
        );
    }


    @PostMapping(
            value = "/{assignmentId}/{userId}/submit",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> makeSubmission(
            @PathVariable String assignmentId,
            @PathVariable String userId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {

        try {
            SubmissionDTO savedSubmissionDTO = submissionService.createSubmissionByAssignmentId(assignmentId, userId, files);

            return new ResponseEntity<>(
                    new ApiResponse(
                            201,
                            "Submission successful..!",
                            savedSubmissionDTO
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
            value = "/{userId}/{assignmentId}/{submissionId}/update",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> updateSubmission(
            @PathVariable String userId,
            @PathVariable String assignmentId,
            @PathVariable String submissionId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "existingFiles", required = false) List<String> existingFiles // URLs of files to keep
    ) {

        try {
            SubmissionDTO updatedSubmission = submissionService.updateSubmissionByAssignmentIdAndSubmissionId(userId, assignmentId, submissionId, files, existingFiles);

            return new ResponseEntity<>(
                    new ApiResponse(
                            201,
                            "Submission updated successfully!",
                            updatedSubmission
                    ),
                    HttpStatus.OK
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

    @DeleteMapping("/delete/{submissionId}")
    public ResponseEntity<ApiResponse> deleteSubmission(@PathVariable String submissionId, @RequestParam String deletingUserId){

        boolean isDeleted =  submissionService.deleteSubmission(submissionId, deletingUserId);
        if(!isDeleted){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to delete submission..!",
                            isDeleted
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Submission deleted successfully..!",
                        isDeleted
                ),
                HttpStatus.OK
        );
    }

}
