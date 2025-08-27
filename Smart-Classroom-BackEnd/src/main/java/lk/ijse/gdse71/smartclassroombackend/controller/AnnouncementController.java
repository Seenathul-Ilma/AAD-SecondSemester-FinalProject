package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.service.AnnouncementService;
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
 * Created: 8/27/2025 11:26 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classrooms")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping("/{classroomId}/view/announcements")
    public ResponseEntity<ApiResponse> getAnnouncements(
            @PathVariable String classroomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<AnnouncementDTO> announcementDTOS = announcementService.getAnnouncementsForClassroomByClassroomId(classroomId, page, size);
        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Announcements paginated successfully..!",
                        announcementDTOS
                ),
                HttpStatus.OK
        );
    }

    @PostMapping(
            value = "/{classroomId}/announcements/{userId}/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> createAnnouncement(
            @PathVariable String classroomId,
            @PathVariable String userId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("content") String content,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {

        try {
            AnnouncementDTO savedAnnouncement = announcementService.createAnnouncementByClassroomId(classroomId, userId, title, content, files);

            return new ResponseEntity<>(
                    new ApiResponse(
                            201,
                            "Announcement created successfully!",
                            savedAnnouncement
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
