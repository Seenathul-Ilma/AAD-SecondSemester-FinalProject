package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.SubmissionDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SubmissionService {
    SubmissionDTO createSubmissionByAssignmentId(String assignmentId, String userId, List<MultipartFile> files) throws IOException;
}
