package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionDTO;
import lk.ijse.gdse71.smartclassroombackend.service.SubmissionService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
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

    @PostMapping(
            value = "/{assignmentId}/{userId}/submit",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> createAnnouncement(
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
}
