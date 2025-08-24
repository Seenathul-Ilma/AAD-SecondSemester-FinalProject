package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;

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

    public String generateNextClassroomId() {
        String year = String.valueOf(LocalDate.now().getYear());
        String prefix = "CLS" + year;   // CLS + 2025

        Classroom lastClassroom = classroomRepository.findTopByOrderByClassroomIdDesc();

        int nextSequence = 1;

        if (lastClassroom != null) {
            String lastId = lastClassroom.getClassroomId();   // CLS20250015
            nextSequence = Integer.parseInt(lastId.substring(7)) + 1;   // extract after CLS2025
        }

        return prefix + String.format("%04d", nextSequence); // CLS20250001

    }

    @Override
    @Transactional
    public Classroom saveClassroom(ClassroomDTO classroomDTO) {
        String newId = generateNextClassroomId();
        if(classroomRepository.existsById(newId)) {
            throw new ResourceDuplicateException("Classroom already exist..!");
        }
        classroomDTO.setClassroomId(newId);

        if (classroomDTO.getClassLevel() == null || classroomDTO.getSubject() == null) {
            throw new IllegalArgumentException("Class-level and Subject are required!");
        }

        // Map DTO to entity
        Classroom classroom = modelMapper.map(classroomDTO, Classroom.class);
        // Generate unique classroom code if missing
        if (classroom.getClassroomCode() == null || classroom.getClassroomCode().isEmpty()) {
            classroom.setClassroomCode(generateUniqueClassroomCode());
        }

        // Save entity
        return classroomRepository.save(classroom);
    }

    private String generateUniqueClassroomCode() {
        String code;
        do {
            code = Classroom.generateRandomClassroomCode();
        } while (classroomRepository.existsByClassroomCode(code));
        return code;
    }

}
