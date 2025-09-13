package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.IllegalArgumentException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.AnnouncementRepository;
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
        Page<Assignment> assignmentPage = assignmentRepository.findByClassroom_ClassroomId(classroomId, PageRequest.of(page, size));

        modelMapper.typeMap(Assignment.class, AssignmentDTO.class).addMappings(mapper -> {
            mapper.map(src -> src.getUser().getUserId(), AssignmentDTO::setAssignedBy);
            mapper.map(src -> src.getClassroom().getClassroomId(), AssignmentDTO::setAssignedTo);
        });

        return assignmentPage.map(assignment -> modelMapper.map(assignment, AssignmentDTO.class));
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
    public String saveFile(MultipartFile file, String classroomId, String userId, String assignmentId, String assignmentCategory) throws IOException {

        File uploadFolder = new File(uploadDirectory);
        if (!uploadFolder.exists()) uploadFolder.mkdirs();

        String extension = "";
        String originalFilename = file.getOriginalFilename();

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String safeAssignmentCategory = assignmentCategory.replaceAll("[^a-zA-Z0-9_-]", "_");

        // Unique filename using timestamp
        String filename = String.format("%s_%s_%s_%s_%d%s",
                safeAssignmentCategory,
                classroomId,
                userId,
                assignmentId,
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
    public AssignmentDTO createAssignmentByClassroomId(String classroomId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException {
        String assignmentId = generateNextAssignmentId();

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Classroom classroom = classroomRepository.findById(classroomId).orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        Assignment assignment = new Assignment();
        assignment.setAssignmentId(assignmentId);
        assignment.setTitle(title);
        assignment.setDescription(content);
        assignment.setAssignedDate(LocalDateTime.now());
        assignment.setDueDate(dueDate);

        String subject = classroom.getSubject().replace(" ", "");
        String level = classroom.getClassLevel().replace(" ", "");
        String assignmentCategory = subject + "_" + level;
        System.out.println("AssignmentCategory: "+assignmentCategory);

        String filePath = saveFile(file, classroomId, userId, assignmentId, assignmentCategory);
        assignment.setFilePath(filePath);

        String fileType = file.getContentType();
        assignment.setFileType(fileType);

        assignment.setUser(user);
        assignment.setClassroom(classroom);

        Assignment savedAssignment = assignmentRepository.save(assignment);

        AssignmentDTO dto = modelMapper.map(savedAssignment, AssignmentDTO.class);
        dto.setAssignedTo(classroomId);
        dto.setAssignedBy(userId);
        dto.setFilePath(filePath);
        dto.setFileType(fileType);

        return dto;
    }

    @Override
    public AssignmentDTO updateAssignmentByAssignmentId(String assignmentId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException {
        Assignment assignment = assignmentRepository.findById(assignmentId)
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

        return dto;
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
            throw new AccessDeniedException("Access denied: Only the uploader or admin can delete this assignment.");
        }

        String existingFilePath = assignmentToDelete.getFilePath();

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
        assignmentRepository.delete(assignmentToDelete);
        return true;
    }
}
