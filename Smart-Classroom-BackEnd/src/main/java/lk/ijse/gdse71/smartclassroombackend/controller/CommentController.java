package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;
import lk.ijse.gdse71.smartclassroombackend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/8/2025 7:11 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/announcements")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/announcement/{announcementId}/user/{userId}/add")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String announcementId,
            @PathVariable String userId,
            @RequestBody CommentDTO commentDTO) {
        CommentDTO savedComment = commentService.addComment(announcementId, userId, commentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }
}
