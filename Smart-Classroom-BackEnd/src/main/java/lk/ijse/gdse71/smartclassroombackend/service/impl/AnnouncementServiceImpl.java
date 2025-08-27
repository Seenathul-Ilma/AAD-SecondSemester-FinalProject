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
    public Page<AnnouncementDTO> getAnnouncementsForClassroomByClassroomId(String classroomId, int page, int size) {
        Page<Announcement> announcementPage = announcementRepository.findByClassroom_ClassroomId(classroomId, PageRequest.of(page, size));
        return announcementPage.map(announcement -> {
            AnnouncementDTO dto = modelMapper.map(announcement, AnnouncementDTO.class);

            // Convert comma-separated strings to List<String>
            dto.setFileUrls(announcement.getFileUrls() != null
                    ? Arrays.asList(announcement.getFileUrls().split(","))
                    : new ArrayList<>());

            dto.setFileTypes(announcement.getFileTypes() != null
                    ? Arrays.asList(announcement.getFileTypes().split(","))
                    : new ArrayList<>());

            // Map nested IDs manually
            dto.setClassroomId(announcement.getClassroom().getClassroomId());
            dto.setAnnouncedUserId(announcement.getUser().getUserId());

            return dto;
        });
    }

    private List<String> saveFiles(List<MultipartFile> files, String classroomId, String userId, String announcementId) throws IOException {
        List<String> filePaths = new ArrayList<>();

        if (files == null || files.isEmpty()) return filePaths;

        File uploadFolder = new File(uploadDirectory);
        if (!uploadFolder.exists()) uploadFolder.mkdirs();

        int fileCounter = 1;
        for (MultipartFile file : files) {
            String extension = "";
            String originalFilename = file.getOriginalFilename();

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Unique filename using timestamp
            String filename = String.format("%s_%s_%s_%d_%d%s",
                    classroomId,
                    userId,
                    announcementId,
                    System.currentTimeMillis(),
                    fileCounter++,
                    extension
            );

            File dest = new File(uploadFolder, filename);
            file.transferTo(dest);
            filePaths.add(dest.getPath());
        }

        return filePaths;
    }

    @Override
    @Transactional
    public AnnouncementDTO createAnnouncementByClassroomId(String classroomId, String userId, String title, String content, List<MultipartFile> files) throws IOException {
        String announcementId = generateNextAnnouncementId();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId).orElseThrow(() -> new RuntimeException("Classroom not found"));

        Announcement announcement = new Announcement();
        announcement.setAnnouncementId(announcementId);
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setUser(user);
        announcement.setClassroom(classroom);
        announcement.setCreatedAt(LocalDateTime.now());

        List<String> fileUrls = saveFiles(files, classroomId, userId, announcementId);
        List<String> fileTypes = new ArrayList<>();
        for (MultipartFile file : files) fileTypes.add(file.getContentType());

        announcement.setFileUrls(String.join(",", fileUrls));
        announcement.setFileTypes(String.join(",", fileTypes));

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        AnnouncementDTO dto = modelMapper.map(savedAnnouncement, AnnouncementDTO.class);
        dto.setClassroomId(classroomId);
        dto.setAnnouncedUserId(userId);
        dto.setFileUrls(fileUrls);
        dto.setFileTypes(fileTypes);

        return dto;
    }

    @Override
    @Transactional
    public AnnouncementDTO updateAnnouncementByAnnouncementId(String userId, String announcementId, String title, String content, List<MultipartFile> files) throws IOException {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setUpdatedAt(LocalDateTime.now());

        if (!announcement.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Only the announcer can update this announcement");
        }

        // Handle files
        List<String> existingFileUrls = announcement.getFileUrls() != null
                ? new ArrayList<>(Arrays.asList(announcement.getFileUrls().split(",")))
                : new ArrayList<>();
        List<String> existingFileTypes = announcement.getFileTypes() != null
                ? new ArrayList<>(Arrays.asList(announcement.getFileTypes().split(",")))
                : new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            // Delete old files
            for (String path : existingFileUrls) {
                File file = new File(path);
                if (file.exists()) {
                    file.delete();
                }
            }
            existingFileUrls.clear();
            existingFileTypes.clear();

            // Save new files
            List<String> newFileUrls = saveFiles(files,
                    announcement.getClassroom().getClassroomId(),
                    announcement.getUser().getUserId(),
                    announcementId);

            for (MultipartFile file : files) existingFileTypes.add(file.getContentType());
            existingFileUrls.addAll(newFileUrls);
        }

        // Update DB
        announcement.setFileUrls(String.join(",", existingFileUrls));
        announcement.setFileTypes(String.join(",", existingFileTypes));

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        AnnouncementDTO dto = modelMapper.map(savedAnnouncement, AnnouncementDTO.class);
        dto.setClassroomId(savedAnnouncement.getClassroom().getClassroomId());
        dto.setAnnouncedUserId(savedAnnouncement.getUser().getUserId());
        dto.setFileUrls(existingFileUrls);
        dto.setFileTypes(existingFileTypes);

        return dto;
    }

}
