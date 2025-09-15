package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.*;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/15/2025 8:17 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class AssignmentCommentServiceImpl implements AssignmentCommentService {

    private final AssignmentCommentRepository commentRepository;
    private final AssignmentRepository announcementRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public CommentDTO addComment(String assignmentId, String userId, CommentDTO dto) {
        Assignment assignment = announcementRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AssignmentComment comment = new AssignmentComment();
        comment.setContent(dto.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setAssignment(assignment);
        comment.setUser(user);

        AssignmentComment saved = commentRepository.save(comment);
        return new CommentDTO(
                saved.getCommentId(),
                assignment.getAssignmentId(),
                user.getUserId(),
                user.getName(),         // <-- commenterName
                saved.getContent(),
                saved.getCreatedAt()
        );
    }


    public List<CommentDTO> getCommentsByAnnouncement(String assignmentId) {
        return commentRepository.findByAssignment_AssignmentId(assignmentId)
                .stream()
                .map(c -> new CommentDTO(
                        c.getCommentId(),
                        c.getAssignment().getAssignmentId(),
                        c.getUser().getUserId(),
                        c.getUser().getName(),
                        c.getContent(),
                        c.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    @Override
    public CommentDTO updateComment(String commentId, CommentDTO dto, String updatingUserId) {
        AssignmentComment comment = commentRepository.findById(Long.valueOf(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        User updatingUser = userRepository.findById(updatingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));

        // Allow only the original author OR an admin
        if (!comment.getUser().getUserId().equals(updatingUserId) && updatingUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Access denied: Only the commenter or an admin can edit this comment.");
        }

        // Update content
        comment.setContent(dto.getContent());
        //comment.setUpdatedAt(LocalDateTime.now()); // add updatedAt field in entity
        AssignmentComment updated = commentRepository.save(comment);

        // Response should always keep original commenter info
        return new CommentDTO(
                updated.getCommentId(),
                updated.getAssignment().getAssignmentId(),
                updated.getUser().getUserId(),   // original commenter
                updated.getUser().getName(),     // original commenter name
                updated.getContent(),
                updated.getCreatedAt()
        );
    }

    @Transactional
    @Override
    public boolean deleteComment(String commentId, String deletingUserId) {
        AssignmentComment comment = commentRepository.findById(Long.valueOf(commentId))
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        Role userRole = userRepository.findById(deletingUserId)
                .map(User::getRole)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));

        // Only author OR admin can delete
        if (!comment.getUser().getUserId().equals(deletingUserId) && !userRole.equals(Role.ADMIN)) {
            throw new AccessDeniedException("Access denied: Only the commenter or an admin can delete this comment.");
        }

        commentRepository.delete(comment);
        return true;
    }


}