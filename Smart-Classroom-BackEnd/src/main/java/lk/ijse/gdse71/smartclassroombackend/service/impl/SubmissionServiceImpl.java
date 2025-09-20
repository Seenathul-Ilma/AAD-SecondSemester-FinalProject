package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.*;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentCommentService;
import lk.ijse.gdse71.smartclassroombackend.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

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
        List<String> fileUrls = saveFiles(files, assignmentId, userId, "SUB"+submissionId);
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

    @Override
    public SubmissionDTO updateSubmissionByAssignmentIdAndSubmissionId(String userId, String assignmentId, String submissionId, List<MultipartFile> newFiles, List<String> existingFiles) throws IOException {
        if (existingFiles == null) {
            existingFiles = new ArrayList<>(); // <-- add this
        }

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));

        if (!submission.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You don't have access to update this submission.");
        }

        submission.setSubmissionDate(LocalDateTime.now());

        // Current files in DB
        List<String> currentFileUrls = submission.getFileUrls() != null
                ? new ArrayList<>(Arrays.asList(submission.getFileUrls().split(",")))
                : new ArrayList<>();

        List<String> currentFileTypes = submission.getFileTypes() != null
                ? new ArrayList<>(Arrays.asList(submission.getFileTypes().split(",")))
                : new ArrayList<>();

        // Normalize frontend URLs to actual internal paths
        List<String> normalizedExistingFiles = existingFiles.stream()
                .map(url -> {
                    try {
                        // extract the file name from URL
                        String fileName = Paths.get(new URI(url).getPath()).getFileName().toString();
                        // find the internal path in currentFileUrls
                        return currentFileUrls.stream()
                                .filter(path -> path.endsWith(fileName))
                                .findFirst()
                                .orElse(null);
                    } catch (URISyntaxException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        // Delete removed files (those in DB but not in existingFilesFromFrontend)
        List<String> filesToDelete = new ArrayList<>();
        for (String url : currentFileUrls) {
            if (!normalizedExistingFiles.contains(url)) {
                filesToDelete.add(url);
            }
        }

        for (String path : filesToDelete) {
            File file = new File(path);
            if (file.exists()) file.delete();
        }

        // Keep only files that user wants to keep
        List<String> updatedFileUrls = new ArrayList<>(normalizedExistingFiles);
        List<String> updatedFileTypes = new ArrayList<>();
        for (String url : normalizedExistingFiles) {
            int idx = currentFileUrls.indexOf(url);
            if (idx >= 0) updatedFileTypes.add(currentFileTypes.get(idx));
            else updatedFileTypes.add("application/octet-stream"); // fallback for safety
        }

        // Save newly uploaded files
        if (newFiles != null && !newFiles.isEmpty()) {
            List<String> newFileUrls = saveFiles(newFiles,
                    assignmentId,
                    submission.getUser().getUserId(),
                    "SUB"+submissionId);
            updatedFileUrls.addAll(newFileUrls);
            updatedFileTypes.addAll(newFiles.stream().map(MultipartFile::getContentType).toList());
        }

        submission.setFileUrls(String.join(",", updatedFileUrls));
        submission.setFileTypes(String.join(",", updatedFileTypes));

        Submission updatedSubmission = submissionRepository.save(submission);

        // Map to DTO
        SubmissionDTO dto = modelMapper.map(updatedSubmission, SubmissionDTO.class);
        dto.setAssignmentId(assignmentId);
        dto.setStudentId(userId);

        String status = "";

        LocalDateTime dueDate = assignment.getDueDate();
        if(dueDate.isBefore(LocalDateTime.now())) {
            submission.setStatus((AssignmentStatus.LATE).toString());
            status = AssignmentStatus.LATE.toString();
        } else {
            submission.setStatus(String.valueOf(AssignmentStatus.SUBMITTED));
            status = AssignmentStatus.SUBMITTED.toString();
        }

        dto.setStatus(status);
        dto.setSubmissionDate(LocalDateTime.now());

        dto.setFileUrls(updatedFileUrls);
        dto.setFileTypes(updatedFileTypes);
        dto.setStudentName(submission.getUser().getName());

        return dto;
    }

    @Override
    public boolean deleteSubmission(String submissionId, String deletingUserId) {
        // Check announcement existence first
        Submission submissionToDelete = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found..!"));


        userRepository.findById(deletingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));

        if (!submissionToDelete.getUser().getUserId().equals(deletingUserId)) {
            throw new AccessDeniedException("Access denied: You don't have access to delete this submission.");
        }

        // delete associated files if exist
        List<String> existingFileUrls = submissionToDelete.getFileUrls() != null
                ? new ArrayList<>(Arrays.asList(submissionToDelete.getFileUrls().split(",")))
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
        submissionRepository.delete(submissionToDelete);
        return true;
    }

    @Override
    public Page<SubmissionDTO> getAllSubmissionsByAnnouncementId(String assignmentId, int page, int size) {
        return null;
    }

    @Override
    public SubmissionDTO getSubmissionByAssignmentId(String assignmentId) {
        return null;
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

            String filename = String.format("%s_%s_%s_%d_%s%s",
                    assignmentId,
                    userId,
                    submissionId,
                    //System.currentTimeMillis(),
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
