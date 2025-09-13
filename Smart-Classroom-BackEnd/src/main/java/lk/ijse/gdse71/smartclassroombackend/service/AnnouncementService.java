package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.AnnouncementDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface AnnouncementService {
    Page<AnnouncementDTO> getAnnouncementsForClassroomByClassroomId(String classroomId, int page, int size);

    AnnouncementDTO createAnnouncementByClassroomId(String classroomId, String userId, String title, String content, List<MultipartFile> files) throws IOException;;

    AnnouncementDTO updateAnnouncementByAnnouncementId(String userId, String announcementId, String title, String content, List<MultipartFile> files) throws IOException;

    boolean deleteAnnouncement(String announcementId, String deletingUserId);

    AnnouncementDTO getAnnouncementById(String announcementId);
}
