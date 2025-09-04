package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.InvitationDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Invitation;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.repository.InvitationRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.BrevoEmailService;
import lk.ijse.gdse71.smartclassroombackend.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/2/2025 9:00 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final BrevoEmailService emailService;
    private final ModelMapper modelMapper;

    public InvitationDTO createInvitation(String email, Role role) {
        if(userRepository.existsByEmail(email)) {
            throw new ResourceDuplicateException("Email already exist..!");
        }

        LocalDateTime expiryDate = LocalDateTime.now().plusDays(7);

        Invitation invitation = Invitation.create(email, role, expiryDate);
        invitationRepository.save(invitation);

        // Build invitation email content
        String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
                "<h2>Welcome to Smart Classroom 🎉</h2>" +
                "<p>Hello <strong>Teacher</strong>,</p>" +
                "<p>You have been invited to join <strong>EduSphere</strong>. Use the following token to register:</p>" +
                "<table style='border-collapse: collapse; width: 100%; max-width: 400px;'>" +
                "  <tr style='background-color: #f2f2f2;'>" +
                "    <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Email</th>" +
                "    <th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Token</th>" +
                "  </tr>" +
                "  <tr>" +
                "    <td style='border: 1px solid #ddd; padding: 8px;'>" + invitation.getEmail() + "</td>" +
                "    <td style='border: 1px solid #ddd; padding: 8px;'>" + invitation.getToken() + "</td>" +
                "  </tr>" +
                "</table>" +
                "<p><strong>Note:</strong> This invitation will expire on " + invitation.getExpiryDate() + ".</p>" +
                "<p>Thanks,<br/>Smart Classroom Team</p>" +
                "</body>" +
                "</html>";

        // Send HTML email
        emailService.sendInvitationEmail(email, "Your Smart Classroom Invitation", htmlContent);

        // Convert entity to DTO
        InvitationDTO dto = modelMapper.map(invitation, InvitationDTO.class);
        dto.setRole(invitation.getRole().name());
        return dto;
    }


    public InvitationDTO useInvitation(String token) {
        Invitation invitation = invitationRepository.findById(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        if (invitation.isUsed()) {
            throw new RuntimeException("Invitation already used");
        }

        if (invitation.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation expired");
        }

        invitation.setUsed(true);
        invitation.setUsedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        InvitationDTO dto = modelMapper.map(invitation, InvitationDTO.class);
        dto.setRole(invitation.getRole().name());
        return dto;
    }

}
