package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.AnnouncementRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.AssignmentRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    public String saveFile(MultipartFile file, String classroomId, String userId, String assignmentId) throws IOException {

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

        String filePath = saveFile(file, classroomId, userId, assignmentId);
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
}
