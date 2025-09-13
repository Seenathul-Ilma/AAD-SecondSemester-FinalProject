package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
        //Page<Announcement> announcementPage = announcementRepository.findByClassroom_ClassroomId(classroomId, PageRequest.of(page, size));
        Page<Announcement> announcementPage = announcementRepository
                .findByClassroom_ClassroomIdOrderByCreatedAtDesc(classroomId, PageRequest.of(page, size));

        return announcementPage.map(announcement -> {
            AnnouncementDTO dto = modelMapper.map(announcement, AnnouncementDTO.class);

            // Convert comma-separated strings to List<String>
            /*dto.setFileUrls(announcement.getFileUrls() != null
                    ? Arrays.asList(announcement.getFileUrls().split(","))
                    : new ArrayList<>());*/
            // Convert internal file paths to frontend-accessible URLs
            List<String> fileUrlsForFrontend = announcement.getFileUrls() != null
                    ? Arrays.stream(announcement.getFileUrls().split(","))
                    .map(path -> {
                        File file = new File(path);
                        return ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/announcements/")
                                .path(file.getName())
                                .toUriString();
                    })
                    .toList()
                    : new ArrayList<>();
            dto.setFileUrls(fileUrlsForFrontend);

            dto.setFileTypes(announcement.getFileTypes() != null
                    ? Arrays.asList(announcement.getFileTypes().split(","))
                    : new ArrayList<>());

            // Map nested IDs manually
            dto.setClassroomId(announcement.getClassroom().getClassroomId());
            dto.setAnnouncedUserId(announcement.getUser().getUserId());
            dto.setClassroomName(announcement.getClassroom().getClassLevel()+" | "+announcement.getClassroom().getSubject());
            dto.setAnnouncedUserName(announcement.getUser().getName());

            List<CommentDTO> commentDTOs = announcement.getComments()
                    .stream()
                    .map(c -> new CommentDTO(
                            c.getCommentId(),
                            announcement.getAnnouncementId(),
                            c.getUser() != null ? c.getUser().getUserId() : null,  // commenterId
                            c.getUser() != null ? c.getUser().getName() : null,    // commenterName
                            c.getContent(),
                            c.getCreatedAt()
                    ))
                    .toList();
            dto.setComments(commentDTOs);

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
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            String trimmedName = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                int dotIndex = originalFilename.lastIndexOf(".");
                extension = originalFilename.substring(dotIndex); // e.g., ".pdf"
                String nameWithoutExt = originalFilename.substring(0, dotIndex);

                // Remove unwanted chars for file system safety
                nameWithoutExt = nameWithoutExt.replaceAll("[^a-zA-Z0-9\\s]", ""); // only letters, numbers, spaces

                // Trim and capitalize each word
                String[] words = nameWithoutExt.trim().split("\\s+");
                StringBuilder sb = new StringBuilder();
                for (String word : words) {
                    if (!word.isEmpty()) {
                        sb.append(Character.toUpperCase(word.charAt(0)))
                                .append(word.substring(1).toLowerCase())
                                .append("_"); // use _ as separator
                    }
                }
                if (sb.length() > 0) sb.setLength(sb.length() - 1); // remove last underscore
                trimmedName = sb.toString();
            }

            // Unique filename: classroomId_userId_announcementId_timestamp_counter_trimmedName.extension
            String filename = String.format("%s_%s_%s_%d_%d_%s%s",
                    classroomId,
                    userId,
                    announcementId,
                    System.currentTimeMillis(),
                    fileCounter++,
                    trimmedName,
                    extension
            );

            File dest = new File(uploadFolder, filename);
            file.transferTo(dest);
            filePaths.add(dest.getPath());
        }


        return filePaths;
    }



/*
    private List<String> saveFiles(List<MultipartFile> files, String classroomId, String userId, String announcementId, List<String> fileNames) throws IOException {
        List<String> filePaths = new ArrayList<>();
        if (files == null || files.isEmpty()) return filePaths;

        File uploadFolder = new File(uploadDirectory);
        if (!uploadFolder.exists()) uploadFolder.mkdirs();

        int fileCounter = 1;

        for (MultipartFile file : files) {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            String trimmedName = "UnknownFile";

            if (originalFilename != null && originalFilename.contains(".")) {
                int dotIndex = originalFilename.lastIndexOf(".");
                extension = originalFilename.substring(dotIndex);
                String nameWithoutExt = originalFilename.substring(0, dotIndex).replaceAll("[^a-zA-Z0-9\\s]", "");
                String[] words = nameWithoutExt.trim().split("\\s+");
                StringBuilder sb = new StringBuilder();
                for (String word : words) {
                    if (!word.isEmpty()) {
                        sb.append(Character.toUpperCase(word.charAt(0)))
                                .append(word.substring(1).toLowerCase())
                                .append(" ");
                    }
                }
                trimmedName = sb.toString().trim();
            }

            String storedFilename = String.format("%s_%s_%s_%d_%d%s",
                    classroomId,
                    userId,
                    announcementId,
                    System.currentTimeMillis(),
                    fileCounter++,
                    extension
            );

            File dest = new File(uploadFolder, storedFilename);
            file.transferTo(dest);

            filePaths.add(dest.getPath());                // internal path
            fileNames.add(trimmedName + extension);      // user-friendly name
        }

        return filePaths;
    }
*/

    @Override
    @Transactional
    public AnnouncementDTO createAnnouncementByClassroomId(String classroomId, String userId, String title, String content, List<MultipartFile> files) throws IOException {
        String announcementId = generateNextAnnouncementId();

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId).orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        Announcement announcement = new Announcement();
        announcement.setAnnouncementId(announcementId);
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setUser(user);
        announcement.setClassroom(classroom);
        announcement.setCreatedAt(LocalDateTime.now());

        if (files == null) files = new ArrayList<>();

        //List<String> fileNames = new ArrayList<>();
        List<String> fileUrls = saveFiles(files, classroomId, userId, announcementId);
        List<String> fileTypes = files != null ? files.stream().map(MultipartFile::getContentType).toList() : new ArrayList<>();

        announcement.setFileUrls(String.join(",", fileUrls));
        announcement.setFileTypes(String.join(",", fileTypes));

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        AnnouncementDTO dto = modelMapper.map(savedAnnouncement, AnnouncementDTO.class);
        dto.setClassroomId(classroomId);
        dto.setAnnouncedUserId(userId);
        dto.setFileUrls(fileUrls);
        dto.setFileTypes(fileTypes);
        //dto.setFileName(fileNames.isEmpty() ? null : String.join(",", fileNames)); // <-- set here
        dto.setAnnouncedUserName(user.getName());
        dto.setClassroomName(classroom.getClassLevel()+" | "+classroom.getSubject());

        return dto;

        /*List<String> fileUrls = saveFiles(files, classroomId, userId, announcementId);
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
        dto.setAnnouncedUserName(user.getName());
        dto.setClassroomName(classroom.getClassLevel()+" | "+classroom.getSubject());

        return dto;*/
    }

    @Override
    @Transactional
    public AnnouncementDTO updateAnnouncementByAnnouncementId(String userId, String announcementId, String title, String content, List<MultipartFile> files) throws IOException {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        // Fetch user and role
        User updatingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));
        //userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role userRole = updatingUser.getRole();

        if (!announcement.getUser().getUserId().equals(userId) && !userRole.equals(Role.ADMIN)) {
            System.out.println("User ROle: "+ userRole);
            throw new AccessDeniedException("Access denied: Only the announcer or admin can modify this announcement.");
        }

        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setUpdatedAt(LocalDateTime.now());

        if (files == null) files = new ArrayList<>();

        List<String> existingFileUrls = announcement.getFileUrls() != null
                ? new ArrayList<>(Arrays.asList(announcement.getFileUrls().split(",")))
                : new ArrayList<>();
        List<String> existingFileTypes = announcement.getFileTypes() != null
                ? new ArrayList<>(Arrays.asList(announcement.getFileTypes().split(",")))
                : new ArrayList<>();
        List<String> fileNames = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            // Delete old files
            for (String path : existingFileUrls) {
                File file = new File(path);
                if (file.exists()) file.delete();
            }
            existingFileUrls.clear();
            existingFileTypes.clear();

            // Save new files
            List<String> newFileUrls = saveFiles(files,
                    announcement.getClassroom().getClassroomId(),
                    announcement.getUser().getUserId(),
                    announcementId
                    //fileNames
            );
            existingFileUrls.addAll(newFileUrls);
            existingFileTypes.addAll(files.stream().map(MultipartFile::getContentType).toList());
        }

        announcement.setFileUrls(String.join(",", existingFileUrls));
        announcement.setFileTypes(String.join(",", existingFileTypes));

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        AnnouncementDTO dto = modelMapper.map(savedAnnouncement, AnnouncementDTO.class);
        dto.setClassroomId(savedAnnouncement.getClassroom().getClassroomId());
        dto.setAnnouncedUserId(savedAnnouncement.getUser().getUserId());
        dto.setFileUrls(existingFileUrls);
        dto.setFileTypes(existingFileTypes);
        //dto.setFileName(fileNames.isEmpty() ? null : String.join(",", fileNames)); // frontend display
        dto.setAnnouncedUserName(savedAnnouncement.getUser().getName());
        dto.setClassroomName(savedAnnouncement.getClassroom().getClassLevel()+" | "+savedAnnouncement.getClassroom().getSubject());

        return dto;

        /*// Handle files
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
        dto.setAnnouncedUserName(announcement.getUser().getName());
        dto.setClassroomName(announcement.getClassroom().getClassLevel()+" | "+announcement.getClassroom().getSubject());

        return dto;*/
    }

    @Override
    @Transactional
    public boolean deleteAnnouncement(String announcementId, String deletingUserId) {
        // Check announcement existence first
        Announcement announcementToDelete = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("No Announcement found..!"));


        User deletingUser = userRepository.findById(deletingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));
        //userRepository.findById(deletingUserId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role userRole = deletingUser.getRole();

        if (!announcementToDelete.getUser().getUserId().equals(deletingUserId) && !userRole.equals(Role.ADMIN)) {
            throw new AccessDeniedException("Access denied: Only the announcer or admin can delete this announcement.");
        }

        // delete associated files if exist
        List<String> existingFileUrls = announcementToDelete.getFileUrls() != null
                ? new ArrayList<>(Arrays.asList(announcementToDelete.getFileUrls().split(",")))
                : new ArrayList<>();


        for (String pathStr : existingFileUrls) {
            File file = new File(pathStr.trim());
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

        // Perform deletion
        announcementRepository.delete(announcementToDelete);
        return true;
    }

    @Override
    public AnnouncementDTO getAnnouncementById(String announcementId) {
        Announcement foundAnnouncement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find announcement with id: " + announcementId));

        AnnouncementDTO dto = modelMapper.map(foundAnnouncement, AnnouncementDTO.class);

        // Handle fileUrls
        /*dto.setFileUrls(foundAnnouncement.getFileUrls() != null
                ? Arrays.asList(foundAnnouncement.getFileUrls().split(","))
                : new ArrayList<>());*/
        List<String> fileUrlsForFrontend = foundAnnouncement.getFileUrls() != null
                ? Arrays.stream(foundAnnouncement.getFileUrls().split(","))
                .map(path -> {
                    File file = new File(path);
                    return ServletUriComponentsBuilder.fromCurrentContextPath()
                            .path("/announcements/")
                            .path(file.getName())
                            .toUriString();
                })
                .toList()
                : new ArrayList<>();
        dto.setFileUrls(fileUrlsForFrontend);

        // Handle fileTypes
        dto.setFileTypes(foundAnnouncement.getFileTypes() != null
                ? Arrays.asList(foundAnnouncement.getFileTypes().split(","))
                : new ArrayList<>());

        // Map nested IDs and names
        dto.setClassroomId(foundAnnouncement.getClassroom().getClassroomId());
        dto.setClassroomName(foundAnnouncement.getClassroom().getClassLevel() + " | " + foundAnnouncement.getClassroom().getSubject());
        dto.setAnnouncedUserId(foundAnnouncement.getUser() != null ? foundAnnouncement.getUser().getUserId() : null);
        dto.setAnnouncedUserName(foundAnnouncement.getUser() != null ? foundAnnouncement.getUser().getName() : null);

        // Map comments
        List<CommentDTO> commentDTOs = foundAnnouncement.getComments()
                .stream()
                .map(c -> new CommentDTO(
                        c.getCommentId(),
                        foundAnnouncement.getAnnouncementId(),
                        c.getUser() != null ? c.getUser().getUserId() : null,
                        c.getUser() != null ? c.getUser().getName() : null,
                        c.getContent(),
                        c.getCreatedAt()
                ))
                .toList();
        dto.setComments(commentDTOs);

        return dto;

    }


}
