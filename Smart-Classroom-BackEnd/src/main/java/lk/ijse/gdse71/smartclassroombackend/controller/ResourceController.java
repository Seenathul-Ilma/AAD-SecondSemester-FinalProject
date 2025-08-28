package lk.ijse.gdse71.smartclassroombackend.controller;

import jakarta.validation.Valid;
import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceUploadRequestDTO;
import lk.ijse.gdse71.smartclassroombackend.service.ResourceService;
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
 * Created: 8/28/2025 7:01 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classrooms/")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping(
            value = "/{classroomId}/resources/{userId}/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse> uploadMaterialToClassroom(
            @PathVariable String classroomId,
            @PathVariable String userId,
            @Valid ResourceUploadRequestDTO requestDTO
            /*@RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file*/
    ) throws IOException {


        //ResourceDTO savedResource = resourceService.uploadMaterialByClassroomId(classroomId, userId, title, description, file);
        ResourceDTO savedResource = resourceService.uploadMaterialByClassroomId(classroomId, userId, requestDTO.getTitle(), requestDTO.getDescription(), requestDTO.getFile());

        return new ResponseEntity<>(
                new ApiResponse(
                        201,
                        "Material uploaded successfully!",
                        savedResource
                ),
                HttpStatus.CREATED
        );
    }

}
