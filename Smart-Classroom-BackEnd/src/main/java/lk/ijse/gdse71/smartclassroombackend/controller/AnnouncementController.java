package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.service.AnnouncementService;
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



    @GetMapping("/{classroomId}/announcements")
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
}
