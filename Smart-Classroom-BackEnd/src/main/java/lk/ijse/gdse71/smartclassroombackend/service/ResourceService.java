package lk.ijse.gdse71.smartclassroombackend.service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/28/2025 7:03 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

public interface ResourceService {
    ResourceDTO uploadMaterialByClassroomId(String classroomId, String userId, String title, String content, MultipartFile file) throws IOException;

    ResourceDTO updateUploadedMaterialByMaterialId(String userId, String materialId, String title, String description, MultipartFile file) throws IOException;

    boolean deleteMaterial(String materialId, String deletingUserId);

    Page<ResourceDTO> getResourcesByClassroomId(String classroomId, int page, int size);
}
