package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AssignmentCommentService {
    @Transactional
    CommentDTO addComment(String assignmentId, String userId, CommentDTO dto);

    @Transactional
    CommentDTO updateComment(String commentId, CommentDTO dto, String updatingUserId);

    @Transactional
    boolean deleteComment(String commentId, String deletingUserId);

    List<CommentDTO> getCommentsByAnnouncement(String announcementId);

}
