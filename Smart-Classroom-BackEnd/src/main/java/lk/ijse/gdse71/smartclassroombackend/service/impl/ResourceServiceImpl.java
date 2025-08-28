package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Announcement;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.Resources;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.IllegalArgumentException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.AnnouncementRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ResourceRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
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

    @Override
    public Page<ResourceDTO> getResourcesByClassroomId(String classroomId, int page, int size) {
        Page<Resources> resourcePage = resourceRepository.findByClassroom_ClassroomId(classroomId, PageRequest.of(page, size));

        modelMapper.typeMap(Resources.class, ResourceDTO.class).addMappings(mapper -> {
            mapper.map(src -> src.getUser().getUserId(), ResourceDTO::setUploadedBy);
            mapper.map(src -> src.getClassroom().getClassroomId(), ResourceDTO::setUploadedTo);
        });

        return resourcePage.map(resource -> modelMapper.map(resource, ResourceDTO.class));
    }

    @Override
    public Page<ResourceDTO> getAllResources(int page, int size) {
        Page<Resources> resourcesPage = resourceRepository.findAll(PageRequest.of(page, size));
        modelMapper.typeMap(Resources.class, ResourceDTO.class).addMappings(mapper -> {
            mapper.map(src -> src.getUser().getUserId(), ResourceDTO::setUploadedBy);
            mapper.map(src -> src.getClassroom().getClassroomId(), ResourceDTO::setUploadedTo);
        });

        return resourcesPage.map(resource -> modelMapper.map(resource, ResourceDTO.class));
    }

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
    @Transactional
    public ResourceDTO uploadMaterialByClassroomId(String classroomId, String userId, String title, String description, MultipartFile file) throws IOException {

        if (file.isEmpty() || file == null) {
            throw new IllegalArgumentException("Material file required..!");
        }

        String materialId = generateNextResourceId();

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId).orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

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

    @Override
    @Transactional
    public ResourceDTO updateUploadedMaterialByMaterialId(String userId, String materialId, String title, String description, MultipartFile material) throws IOException {

        Resources resources = resourceRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!resources.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: Only the uploader can modify this material.");
        }

        if (material == null || material.isEmpty()) {
            throw new IllegalArgumentException("Material file required..!");
        }

        resources.setTitle(title);
        resources.setDescription(description);
        resources.setUpdatedAt(LocalDateTime.now());

        if (material != null && !material.isEmpty()) {
            // Delete old file
            File oldFile = new File(resources.getFilePath());
            if (oldFile.exists()) oldFile.delete();

            // Save new file
            String newFilePath = saveFile(material, resources.getClassroom().getClassroomId(), userId, materialId);
            resources.setFilePath(newFilePath);
            resources.setFileType(material.getContentType());
        }

        Resources updatedResource = resourceRepository.save(resources);

        ResourceDTO dto = modelMapper.map(updatedResource, ResourceDTO.class);
        dto.setUploadedBy(userId);
        dto.setUploadedTo(resources.getClassroom().getClassroomId());

        return dto;
    }

    @Override
    @Transactional
    public boolean deleteMaterial(String materialId, String deletingUserId) {
        Resources resourcesToDelete = resourceRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        userRepository.findById(deletingUserId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!resourcesToDelete.getUser().getUserId().equals(deletingUserId)) {
            throw new AccessDeniedException("Access denied: Only the uploader can delete this material.");
        }

        String existingFilePath = resourcesToDelete.getFilePath();

        if (existingFilePath != null && !existingFilePath.isBlank()) {
            File file = new File(existingFilePath.trim());
            System.out.println("Trying to delete: " + file.getAbsolutePath());

            if (file.exists()) {
                boolean deleted = file.delete();
                System.out.println("Deleted: " + deleted);

                if (!deleted) {
                    throw new RuntimeException("Failed to delete: " + file.getAbsolutePath());
                }
            } else {
                System.out.println("File not found: " + file.getAbsolutePath());
            }
        }

        // Delete the resource from DB
        resourceRepository.delete(resourcesToDelete);
        return true;
    }

}
