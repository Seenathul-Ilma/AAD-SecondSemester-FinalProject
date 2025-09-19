package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.IllegalArgumentException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.AssignmentRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentService;
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
 * Created: 8/29/2025 9:51 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ModelMapper modelMapper;

    @Value("${assignments.upload.dir:uploads/assignments}")
    private String uploadDirectory;      // default folder if not set in application.properties


    @Override
    public Page<AssignmentDTO> getAssignmentsByClassroomId(String classroomId, int page, int size) {
        Page<Assignment> assignmentPage = assignmentRepository
                .findByClassroom_ClassroomIdOrderByAssignedDateDesc(classroomId, PageRequest.of(page, size));
                //.findByClassroom_ClassroomId(classroomId, PageRequest.of(page, size));

        return assignmentPage.map(assignment -> {
            AssignmentDTO assignmentDTO = modelMapper.map(assignment, AssignmentDTO.class);

            List<String> fileUrlsForFrontend = assignment.getFileUrls() != null
                    ? Arrays.stream(assignment.getFileUrls().split(","))
                    .map(path -> {
                        File file = new File(path);
                        return ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/assignments/")
                                .path(file.getName())
                                .toUriString();
                    })
                    .toList()
                    : new ArrayList<>();
            assignmentDTO.setFileUrls(fileUrlsForFrontend);

            assignmentDTO.setFileTypes(assignment.getFileTypes() != null
                    ? Arrays.asList(assignment.getFileTypes().split(","))
                    : new ArrayList<>());

            assignmentDTO.setAssignedTo(assignment.getClassroom().getClassroomId());
            assignmentDTO.setAssignedBy(assignment.getUser().getUserId());
            assignmentDTO.setClassroomName(assignment.getClassroom().getClassLevel()+" | "+assignment.getClassroom().getSubject());
            assignmentDTO.setAssignedUserName(assignment.getUser().getName());

            List<CommentDTO> commentDTOs = assignment.getComments()
                    .stream()
                    .map(c -> new CommentDTO(
                            c.getCommentId(),
                            assignment.getAssignmentId(),
                            c.getUser() != null ? c.getUser().getUserId() : null,  // commenterId
                            c.getUser() != null ? c.getUser().getName() : null,    // commenterName
                            c.getContent(),
                            c.getCreatedAt()
                    ))
                    .toList();
            assignmentDTO.setComments(commentDTOs);

            return assignmentDTO;
        });

        /*modelMapper.typeMap(Assignment.class, AssignmentDTO.class).addMappings(mapper -> {
            mapper.map(src -> src.getUser().getUserId(), AssignmentDTO::setAssignedBy);
            mapper.map(src -> src.getClassroom().getClassroomId(), AssignmentDTO::setAssignedTo);
        });*/

        //return assignmentPage.map(assignment -> modelMapper.map(assignment, AssignmentDTO.class));
    }

    @Override
    public Page<AssignmentDTO> getAllAssignments(int page, int size) {
        Page<Assignment> assignmentPage = assignmentRepository.findAll(PageRequest.of(page, size));
        modelMapper.typeMap(Assignment.class, AssignmentDTO.class).addMappings(mapper -> {
            mapper.map(src -> src.getUser().getUserId(), AssignmentDTO::setAssignedBy);
            mapper.map(src -> src.getClassroom().getClassroomId(), AssignmentDTO::setAssignedTo);
        });

        return assignmentPage.map(assignment -> modelMapper.map(assignment, AssignmentDTO.class));
    }

    @Override
    public String generateNextAssignmentId() {

        String year = String.valueOf(LocalDate.now().getYear());
        String fullPrefix = "ASG" + year;   // ATT + 2025

        int nextSequence = 1;

        Assignment lastAssignment = assignmentRepository.findTopByOrderByAssignmentIdDesc();
        if (lastAssignment != null) {
            String lastId = lastAssignment.getAssignmentId();   // ASG20250015
            nextSequence = Integer.parseInt(lastId.substring(fullPrefix.length())) + 1;
        }

        return fullPrefix + String.format("%04d", nextSequence); // ASG20250001

    }

    @Override
    public List<String> saveFiles(List<MultipartFile> files, String classroomId, String userId, String assignmentId, String assignmentCategory) throws IOException {

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

            String safeAssignmentCategory = assignmentCategory.replaceAll("[^a-zA-Z0-9_-]","_");

            // Unique filename: classroomId_userId_announcementId_timestamp_counter_trimmedName.extension

            String filename = String.format("%s_%s_%s_%d_%d_%s_%s%s",
                    classroomId,
                    userId,
                    assignmentId,
                    System.currentTimeMillis(),
                    fileCounter++,
                    safeAssignmentCategory,
                    trimmedName,
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
    public AssignmentDTO createAssignmentByClassroomId(String classroomId, String userId, String content, List<MultipartFile> files, LocalDateTime dueDate) throws IOException {
        String assignmentId = generateNextAssignmentId();

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId).orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        Assignment assignment = new Assignment();
        assignment.setAssignmentId(assignmentId);
        //assignment.setTitle(title);
        assignment.setDescription(content);
        assignment.setUser(user);
        assignment.setClassroom(classroom);
        assignment.setAssignedDate(LocalDateTime.now());
        assignment.setDueDate(dueDate);

        String subject = classroom.getSubject().replace(" ", "");
        String level = classroom.getClassLevel().replace(" ", "");
        String assignmentCategory = subject + "_" + level;
        System.out.println("AssignmentCategory: "+assignmentCategory);

        if (files == null) files = new ArrayList<>();

        //List<String> fileNames = new ArrayList<>();
        List<String> fileUrls = saveFiles(files, classroomId, userId, assignmentId, assignmentCategory);
        List<String> fileTypes = files != null ? files.stream().map(MultipartFile::getContentType).toList() : new ArrayList<>();

        assignment.setFileUrls(String.join(",", fileUrls));
        assignment.setFileTypes(String.join(",", fileTypes));

        Assignment savedAssignment = assignmentRepository.save(assignment);

        AssignmentDTO dto = modelMapper.map(savedAssignment, AssignmentDTO.class);
        dto.setAssignedTo(classroomId);
        dto.setAssignedBy(userId);
        dto.setFileUrls(fileUrls);
        dto.setFileTypes(fileTypes);

        dto.setAssignedUserName(user.getName());
        dto.setClassroomName(classroom.getClassLevel()+" | "+classroom.getSubject());

        return dto;
    }

    @Override
    public Boolean updateAssignmentByAssignmentId(String assignmentId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException {
    //public AssignmentDTO updateAssignmentByAssignmentId(String assignmentId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException {
        /*Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        User updatingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));
        //userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role userRole = updatingUser.getRole();

        if (!assignment.getUser().getUserId().equals(userId) && !userRole.equals(Role.ADMIN)) {
            throw new AccessDeniedException("Access denied: Only the creator or admin can modify this assignment.");
        }

        if (file.isEmpty() || file == null) {
            throw new IllegalArgumentException("Assignment file required..!");
        }

        assignment.setTitle(title);
        assignment.setDescription(content);
        assignment.setAssignedDate(assignment.getAssignedDate());
        assignment.setUpdatedAt(LocalDateTime.now());

        if (dueDate.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Due date cannot be in the past");
        }

        assignment.setDueDate(dueDate);

        String subject = assignment.getClassroom().getSubject().replace(" ", "");
        String level = assignment.getClassroom().getClassLevel().replace(" ", "");
        String assignmentCategory = subject + "_" + level;
        System.out.println("AssignmentCategory: "+assignmentCategory);

        assignment.setUser(assignment.getUser());
        assignment.setClassroom(assignment.getClassroom());

        if (file != null && !file.isEmpty()) {
            // Delete old file
            File oldFile = new File(assignment.getFilePath());
            if (oldFile.exists()) oldFile.delete();

            // Save new file
            String newFilePath = saveFile(file, assignment.getClassroom().getClassroomId(), userId, assignmentId, assignmentCategory);
            assignment.setFilePath(newFilePath);
            assignment.setFileType(file.getContentType());
        }

        Assignment updatedAssignment = assignmentRepository.save(assignment);

        AssignmentDTO dto = modelMapper.map(updatedAssignment, AssignmentDTO.class);
        dto.setAssignedTo(updatedAssignment.getClassroom().getClassroomId());
        dto.setAssignedBy(updatedAssignment.getUser().getUserId());

        return dto;*/
        return false;
    }

    @Override
    public boolean deleteAssignment(String assignmentId, String deletingUserId) {
        Assignment assignmentToDelete = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));


        User deletingUser = userRepository.findById(deletingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));
        //userRepository.findById(deletingUserId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role userRole = deletingUser.getRole();

        if (!assignmentToDelete.getUser().getUserId().equals(deletingUserId) && !userRole.equals(Role.ADMIN)) {
            throw new AccessDeniedException("Access denied: Only the creator or admin can delete this assignment.");
        }

        // delete associated files if exist
        List<String> existingFileUrls = assignmentToDelete.getFileUrls() != null
                ? new ArrayList<>(Arrays.asList(assignmentToDelete.getFileUrls().split(",")))
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
        assignmentRepository.delete(assignmentToDelete);
        return true;

    }
}
