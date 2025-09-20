package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionCountDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SubmissionService {
    SubmissionDTO createSubmissionByAssignmentId(String assignmentId, String userId, List<MultipartFile> files) throws IOException;

    SubmissionDTO updateSubmissionByAssignmentIdAndSubmissionId(String userId, String announcementId, String submissionId, List<MultipartFile> files, List<String> existingFiles) throws IOException;

    boolean deleteSubmission(String submissionId, String deletingUserId);

    Page<SubmissionDTO> getAllSubmissionsByStatusAnnouncementId(String assignmentId, AssignmentStatus submitStatus, int page, int size);

    SubmissionDTO getSubmissionBySubmissionId(String submissionId);

    SubmissionCountDTO getSubmissionCounts(String assignmentId);
}
