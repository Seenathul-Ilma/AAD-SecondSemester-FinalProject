package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/23/2025 9:58 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<ClassroomDTO> getClassroomsByPaginated(int page, int size) {
        // Pass role first, then pageable
        Page<Classroom> classroomPage = classroomRepository.findAll(PageRequest.of(page, size));

        // Map each User entity to UserDTO
        return classroomPage.map(classroom -> modelMapper.map(classroom, ClassroomDTO.class));
    }

}
