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

    @GetMapping("/announcements/{announcementId}")
    public ResponseEntity<ApiResponse> getAnnouncementById(@PathVariable String announcementId){
        AnnouncementDTO foundAnnouncement = announcementService.getAnnouncementById(announcementId);

        if (foundAnnouncement == null) {
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to find announcement..!",
                            null
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Announcement found..!",
                        foundAnnouncement
                ),
                HttpStatus.CREATED
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

    @PutMapping(
            value = "/{userId}/announcements/{announcementId}/update",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> updateAnnouncement(
            @PathVariable String userId,
            @PathVariable String announcementId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("content") String content,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "existingFiles", required = false) List<String> existingFiles // URLs of files to keep
    ) {

        try {
            AnnouncementDTO savedAnnouncement = announcementService.updateAnnouncementByAnnouncementId(userId, announcementId, title, content, files, existingFiles);

            return new ResponseEntity<>(
                    new ApiResponse(
                            201,
                            "Announcement updated successfully!",
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

    @DeleteMapping("/delete/{announcementId}")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable String announcementId, @RequestParam String deletingUserId){

        boolean isDeleted =  announcementService.deleteAnnouncement(announcementId, deletingUserId);
        if(!isDeleted){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to delete announcement..!",
                            isDeleted
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Announcement deleted successfully..!",
                        isDeleted
                ),
                HttpStatus.OK
        );
    }

}
