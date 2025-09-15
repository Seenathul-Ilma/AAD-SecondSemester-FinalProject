package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import lk.ijse.gdse71.smartclassroombackend.service.AssignmentCommentService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/15/2025 6:22 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/


@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classrooms/assignments/comments")
@RequiredArgsConstructor
public class AssignmentCommentController {

    private final AssignmentCommentService commentService;

    @PostMapping("/assignment/{assignmentId}/user/{userId}/add")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String assignmentId,
            @PathVariable String userId,
            @RequestBody CommentDTO commentDTO) {
        CommentDTO savedComment = commentService.addComment(assignmentId, userId, commentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByAssignment(@PathVariable String assignmentId) {
        List<CommentDTO> comments = commentService.getCommentsByAnnouncement(assignmentId);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse> updateComment(@PathVariable String commentId,
                                                     @RequestBody CommentDTO dto,
                                                     @RequestParam String userId) {
        CommentDTO updatedComment = commentService.updateComment(commentId, dto, userId);

        if (updatedComment == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(400, "Failed to update comment..!", null));
        }

        return ResponseEntity
                .ok(new ApiResponse(200, "Comment updated successfully..!", updatedComment));
    }

    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(@PathVariable String commentId, @RequestParam String userId) {

        boolean isDeleted = commentService.deleteComment(commentId, userId);
        if(!isDeleted){
            return new ResponseEntity<>(
                    new ApiResponse(
                            400,
                            "Failed to delete comment..!",
                            isDeleted
                    ),
                    HttpStatus.BAD_REQUEST
            );
        }

        return new ResponseEntity<>(
                new ApiResponse(
                        200,
                        "Deletion successful..!",
                        isDeleted
                ),
                HttpStatus.OK
        );
    }

}
