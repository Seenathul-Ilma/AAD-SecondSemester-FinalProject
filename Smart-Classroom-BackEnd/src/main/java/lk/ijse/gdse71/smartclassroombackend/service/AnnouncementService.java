package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import org.springframework.data.domain.Page;

public interface AnnouncementService {
    Page<AnnouncementDTO> getAnnouncementsForClassroomByClassroomId(String classroomId, int page, int size);
}
