package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Announcement;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.entity.UserClassroom;
import lk.ijse.gdse71.smartclassroombackend.repository.AnnouncementRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.AnnouncementService;
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
 * Created: 8/27/2025 10:07 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ModelMapper modelMapper;

    @Value("${announcement.upload.dir:uploads/announcements}")
    private String uploadDirectory; // default folder if not set in application.properties

    private String generateNextAnnouncementId() {
        String year = String.valueOf(LocalDate.now().getYear());
        String fullPrefix = "ANN" + year;   // CLS + 2025  / REG + 2025

        int nextSequence = 1;

        Announcement lastAnnouncement = announcementRepository.findTopByOrderByAnnouncementIdDesc();
        if (lastAnnouncement != null) {
            String lastId = lastAnnouncement.getAnnouncementId();   // ANN20250015
            nextSequence = Integer.parseInt(lastId.substring(fullPrefix.length())) + 1;
        }

        return fullPrefix + String.format("%04d", nextSequence); // ANN20250001
    }

    @Override
    @Transactional
    public AnnouncementDTO createAnnouncementByClassroomId(String classroomId, String userId, String title, String content, List<MultipartFile> files) throws IOException {
        String announcementId = generateNextAnnouncementId();

        // Fetch User and Classroom
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        // Create announcement entity
        Announcement announcement = new Announcement();
        announcement.setAnnouncementId(announcementId);
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setUser(user);
        announcement.setClassroom(classroom);
        announcement.setCreatedAt(LocalDateTime.now());

        List<String> fileUrls = new ArrayList<>();
        List<String> fileTypes = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            File uploadFolder = new File(uploadDirectory);
            if (!uploadFolder.exists()) uploadFolder.mkdirs();

            int fileCounter = 1;
            for (MultipartFile file : files) {
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }

                String filename = String.format("%s_%s_%s_%d%s",
                        classroomId,
                        userId,
                        announcementId,
                        fileCounter++,
                        extension
                );

                File dest = new File(uploadFolder, filename);
                file.transferTo(dest);

                fileUrls.add(dest.getPath());
                fileTypes.add(file.getContentType());
            }
        }

        // Save file URLs and types as comma-separated strings
        announcement.setFileUrls(String.join(",", fileUrls));
        announcement.setFileTypes(String.join(",", fileTypes));

        // Save the entity once
        Announcement savedAnnouncement = announcementRepository.save(announcement);

        // Convert to DTO and split the comma-separated strings into lists
        AnnouncementDTO dto = modelMapper.map(savedAnnouncement, AnnouncementDTO.class);
        dto.setClassroomId(classroomId);
        dto.setAnnouncedUserId(userId);

        dto.setFileUrls(savedAnnouncement.getFileUrls() != null
                ? Arrays.asList(savedAnnouncement.getFileUrls().split(","))
                : new ArrayList<>());

        dto.setFileTypes(savedAnnouncement.getFileTypes() != null
                ? Arrays.asList(savedAnnouncement.getFileTypes().split(","))
                : new ArrayList<>());

        return dto;
    }


    @Override
    public Page<AnnouncementDTO> getAnnouncementsForClassroomByClassroomId(String classroomId, int page, int size) {
        Page<Announcement> announcementPage = announcementRepository.findByClassroom_ClassroomId(classroomId, PageRequest.of(page, size));
        return announcementPage.map(announcement -> modelMapper.map(announcement, AnnouncementDTO.class));
    }
}
