package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

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

    public String generateNextClassroomId() {
        String year = String.valueOf(LocalDate.now().getYear());

        String prefix = "CLS" + year;   // STU + 2025

        Classroom lastClassroom = classroomRepository.findTopByOrderByClassroomIdDesc();

        int nextSequence = 1;

        if (lastClassroom != null) {
            String lastId = lastClassroom.getClassroomId();   // CLS20250015
            nextSequence = Integer.parseInt(lastId.substring(7)) + 1;   // extract after CLS2025
        }

        return prefix + String.format("%04d", nextSequence); // CLS20250001

    }


    @Override
    public Page<ClassroomDTO> getClassroomsByPaginated(int page, int size) {
        // Pass role first, then pageable
        Page<Classroom> classroomPage = classroomRepository.findAll(PageRequest.of(page, size));

        // Map each User entity to UserDTO
        return classroomPage.map(classroom -> modelMapper.map(classroom, ClassroomDTO.class));
    }

    @Override
    public Classroom saveClassroom(ClassroomDTO classroomDTO) {
        String newId = generateNextClassroomId();
        classroomDTO.setClassroomId(newId);

        if (classroomDTO.getClassLevel() == null || classroomDTO.getSubject() == null) {
            throw new IllegalArgumentException("Class-level and Subject are required!");
        }

        String classroomCode = generateUniqueClassroomCode();
        classroomDTO.setClassroomCode(classroomCode);

        Classroom classroom = modelMapper.map(classroomDTO, Classroom.class);

        classroomRepository.save(classroom);

        return classroom; // return the saved entity
    }

    // Random 8-character alphanumeric code generator
    private String generateClassroomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    // Ensure uniqueness by checking repository
    private String generateUniqueClassroomCode() {
        String code;
        do {
            code = generateClassroomCode();
        } while (classroomRepository.existsByClassroomCode(code));
        return code;
    }

}
