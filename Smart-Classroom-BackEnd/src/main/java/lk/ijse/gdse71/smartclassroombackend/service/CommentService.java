package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.CommentDTO;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/7/2025 11:34 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

public interface CommentService {

    CommentDTO addComment(String announcementId, String userId, CommentDTO commentDTO);
}
