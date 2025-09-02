package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.InvitationDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;

public interface InvitationService {

    InvitationDTO createInvitation(String email, Role role);

    InvitationDTO useInvitation(String token);
}
