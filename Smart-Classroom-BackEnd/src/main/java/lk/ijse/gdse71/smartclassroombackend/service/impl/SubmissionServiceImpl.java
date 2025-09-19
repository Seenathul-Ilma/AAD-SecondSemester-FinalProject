package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.*;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentCommentService;
import lk.ijse.gdse71.smartclassroombackend.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/19/2025 8:32 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ModelMapper modelMapper;

    @Value("${submission.upload.dir:uploads/submissions}")
    private String uploadDirectory; // default folder if not set in application.properties


    @Override
    public SubmissionDTO createSubmissionByAssignmentId(String assignmentId, String userId, List<MultipartFile> files) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        //Classroom classroom1 = classroomRepository.findById(classroomId).orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (submissionRepository.existsByUserAndAssignment(user, assignment)) {
            throw new ResourceDuplicateException("You have already submitted this assignment!");
        }

        String submissionId = UUID.randomUUID().toString();

        Submission submission = new Submission();
        submission.setSubmissionId(submissionId);
        submission.setUser(user);
        submission.setAssignment(assignment);
        submission.setSubmissionDate(LocalDateTime.now());
        String status = "";

        LocalDateTime dueDate = assignment.getDueDate();
        if(dueDate.isBefore(LocalDateTime.now())) {
            submission.setStatus((AssignmentStatus.LATE).toString());
            status = AssignmentStatus.LATE.toString();
        } else {
            submission.setStatus(String.valueOf(AssignmentStatus.SUBMITTED));
            status = AssignmentStatus.SUBMITTED.toString();
        }


       /* String submittedBy = user.getUserId().replace(" ", "");
        String submissionFor = assignment.getAssignmentId().replace(" ", "");
        String submissionCategory = submittedBy + "_" + submissionFor;
        System.out.println("AssignmentCategory: "+submissionCategory);*/

        if (files == null) files = new ArrayList<>();

        //List<String> fileNames = new ArrayList<>();
        List<String> fileUrls = saveFiles(files, assignmentId, userId, submissionId);
        List<String> fileTypes = files != null ? files.stream().map(MultipartFile::getContentType).toList() : new ArrayList<>();

        submission.setFileUrls(String.join(",", fileUrls));
        submission.setFileTypes(String.join(",", fileTypes));

        Submission savedSubmission = submissionRepository.save(submission);

        SubmissionDTO dto = modelMapper.map(savedSubmission, SubmissionDTO.class);
        dto.setAssignmentId(assignmentId);
        dto.setStudentId(userId);
        dto.setFileUrls(fileUrls);
        dto.setFileTypes(fileTypes);
        dto.setStatus(status);
        dto.setSubmissionDate(LocalDateTime.now());

        dto.setStudentName(user.getName());

        return dto;
    }

    private List<String> saveFiles(List<MultipartFile> files, String assignmentId, String userId, String submissionId) throws IOException {
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

            String filename = String.format("%s_%s_%s_%d_%d_%s%s",
                    assignmentId,
                    userId,
                    submissionId,
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
}
