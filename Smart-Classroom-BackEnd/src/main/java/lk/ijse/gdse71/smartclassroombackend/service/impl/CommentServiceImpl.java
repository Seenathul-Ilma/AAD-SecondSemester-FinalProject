package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Announcement;
import lk.ijse.gdse71.smartclassroombackend.entity.Comment;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.AnnouncementRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.CommentRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.CommentService;
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
 * Created: 9/7/2025 11:33 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommentDTO addComment(String announcementId, String userId, CommentDTO dto) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setAnnouncement(announcement);
        comment.setUser(user);

        Comment saved = commentRepository.save(comment);
        return new CommentDTO(
                saved.getCommentId(),
                announcement.getAnnouncementId(),
                user.getUserId(),
                user.getName(),         // <-- commenterName
                saved.getContent(),
                saved.getCreatedAt()
        );
    }

    public List<CommentDTO> getCommentsByAnnouncement(String announcementId) {
        return commentRepository.findByAnnouncement_AnnouncementId(announcementId)
                .stream()
                .map(c -> new CommentDTO(
                        c.getCommentId(),
                        c.getAnnouncement().getAnnouncementId(),
                        c.getUser().getUserId(),
                        c.getUser().getName(),
                        c.getContent(),
                        c.getCreatedAt()
                        ))
                .toList();
    }

    @Override
    @Transactional
    public CommentDTO updateComment(String commentId, CommentDTO dto, String updatingUserId) {
        Comment comment = commentRepository.findById(Long.valueOf(commentId))
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
        Comment updated = commentRepository.save(comment);

        // Response should always keep original commenter info
        return new CommentDTO(
                updated.getCommentId(),
                updated.getAnnouncement().getAnnouncementId(),
                updated.getUser().getUserId(),   // original commenter
                updated.getUser().getName(),     // original commenter name
                updated.getContent(),
                updated.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public boolean deleteComment(String commentId, String deletingUserId) {
        Comment comment = commentRepository.findById(Long.valueOf(commentId))
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
