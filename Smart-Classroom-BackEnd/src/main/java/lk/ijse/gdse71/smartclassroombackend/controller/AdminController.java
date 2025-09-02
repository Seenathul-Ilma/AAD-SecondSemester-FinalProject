package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.InvitationDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.InviteTeacherDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.InvitationService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 8:48 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final InvitationService invitationService;

    @PostMapping("/invite-teacher")
    public ResponseEntity<ApiResponse> inviteTeacher(@RequestBody InviteTeacherDTO dto) {
        InvitationDTO invitation = invitationService.createInvitation(dto.getEmail(), Role.TEACHER);
        return ResponseEntity.ok(new ApiResponse(200, "Invitation sent", invitation));
    }
}

