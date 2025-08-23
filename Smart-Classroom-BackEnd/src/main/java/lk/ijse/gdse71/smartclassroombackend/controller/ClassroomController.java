package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import lk.ijse.gdse71.smartclassroombackend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/23/2025 9:57 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/classroom")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping("/all/paginated")
    public Page<ClassroomDTO> getPaginatedClassroom(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return classroomService.getClassroomsByPaginated(page, size);
    }
}
