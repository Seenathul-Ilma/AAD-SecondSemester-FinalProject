package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Announcement;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.Resources;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.repository.AnnouncementRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ResourceRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/28/2025 7:02 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ModelMapper modelMapper;

    @Value("${materials.upload.dir:uploads/materials}")
    private String uploadDirectory; // default folder if not set in application.properties

    private String generateNextResourceId() {

        String year = String.valueOf(LocalDate.now().getYear());
        String fullPrefix = "ATT" + year;   // ATT + 2025

        int nextSequence = 1;

        Resources lastMaterial = resourceRepository.findTopByOrderByResourceIdDesc();
        if (lastMaterial != null) {
            String lastId = lastMaterial.getResourceId();   // ATT20250015
            nextSequence = Integer.parseInt(lastId.substring(fullPrefix.length())) + 1;
        }

        return fullPrefix + String.format("%04d", nextSequence); // ATT20250001

    }


    private String saveFile(MultipartFile file, String classroomId, String userId, String materialId) throws IOException {

        File uploadFolder = new File(uploadDirectory);
        if (!uploadFolder.exists()) uploadFolder.mkdirs();

        String extension = "";
        String originalFilename = file.getOriginalFilename();

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Unique filename using timestamp
        String filename = String.format("%s_%s_%s_%d%s",
                classroomId,
                userId,
                materialId,
                System.currentTimeMillis(),
                extension
        );

        File dest = new File(uploadFolder, filename);
        file.transferTo(dest);
        String filePath = dest.getPath();

        return filePath;
    }

    @Override
    public ResourceDTO uploadMaterialByClassroomId(String classroomId, String userId, String title, String description, MultipartFile file) throws IOException {

        if (file.isEmpty() || file == null) {
            throw new RuntimeException("Material file required..!");
        }

        String materialId = generateNextResourceId();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId).orElseThrow(() -> new RuntimeException("Classroom not found"));

        Resources resources = new Resources();
        resources.setResourceId(materialId);
        resources.setTitle(title);
        resources.setDescription(description);
        resources.setUser(user);
        resources.setClassroom(classroom);
        resources.setUploadedAt(LocalDateTime.now());

        String filePath = saveFile(file, classroomId, userId, materialId);
        resources.setFilePath(filePath);

        String fileType = file.getContentType();
        resources.setFileType(fileType);

        /*String extension = "";
        if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
            extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".") + 1);
        }
        resources.setFileType(extension.toLowerCase());*/

        Resources uploadedMaterial = resourceRepository.save(resources);

        ResourceDTO dto = modelMapper.map(uploadedMaterial, ResourceDTO.class);
        dto.setUploadedTo(classroomId);
        dto.setUploadedBy(userId);
        dto.setFilePath(filePath);
        dto.setFileType(fileType);

        return dto;
        //return modelMapper.map(uploadedMaterial, ResourceDTO.class);
    }
}
