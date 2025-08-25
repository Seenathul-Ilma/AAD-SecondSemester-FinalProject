package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.ClassroomRole;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.entity.UserClassroom;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.UserClassroomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/24/2025 8:56 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class UserClassroomServiceImpl implements UserClassroomService {
    private final ClassroomRepository classroomRepository;
    private final UserClassroomRepository userClassroomRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    public String generateNextClassroomId(String prefix) {
        String year = String.valueOf(LocalDate.now().getYear());
        String fullPrefix = prefix + year;   // REG + 2025

        UserClassroom lastUserClassroom = userClassroomRepository.findTopByOrderByUserClassroomIdDesc();

        int nextSequence = 1;

        if(lastUserClassroom != null) {
            String lastId = lastUserClassroom.getUserClassroomId(); // REG20250003
            nextSequence = Integer.parseInt(lastId.substring(fullPrefix.length())) + 1;
        }
        return fullPrefix + String.format("%04d", nextSequence); // REG20250001
    }


    @Override
    @Transactional
    public UserClassroomDTO joinClassroomByCode(String studentId, String classroomCode) {
        // Generate manual ID
        String newId = generateNextClassroomId("REG");

        // Fetch student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));

        // Fetch classroom
        Classroom classroom = classroomRepository.findByClassroomCode(classroomCode)
                .orElseThrow(() -> new RuntimeException("Classroom not found!"));

        // Check if already joined
        boolean alreadyJoined = userClassroomRepository.existsByUserAndClassroom(student, classroom);
        if (alreadyJoined) {
            throw new RuntimeException("Student already joined this classroom!");
        }

        // Create UserClassroom
        UserClassroom userClassroom = new UserClassroom();
        userClassroom.setUserClassroomId(newId);
        userClassroom.setUser(student);
        userClassroom.setClassroom(classroom);
        userClassroom.setJoinedAt(java.time.LocalDateTime.now());
        userClassroom.setRoleInClassroom(ClassroomRole.STUDENT);  // default role
        userClassroom.setCreator(false);  // not the creator

        // Save to DB
        UserClassroom savedUC = userClassroomRepository.save(userClassroom);

        // ModelMapper explicit mapping to avoid conflict
        /*ModelMapper mapper = new ModelMapper();
        mapper.typeMap(UserClassroom.class, UserClassroomDTO.class)
                .addMappings(m -> m.map(src -> src.getUser().getUserId(), UserClassroomDTO::setMemberId))
                .addMappings(m -> m.map(src -> src.getClassroom().getClassroomId(), UserClassroomDTO::setClassroomId));

        return mapper.map(savedUC, UserClassroomDTO.class);*/

        // Use the injected modelMapper
        modelMapper.typeMap(UserClassroom.class, UserClassroomDTO.class)
                .addMappings(m -> m.map(src -> src.getUser().getUserId(), UserClassroomDTO::setMemberId))
                .addMappings(m -> m.map(src -> src.getClassroom().getClassroomId(), UserClassroomDTO::setClassroomId));

        return modelMapper.map(savedUC, UserClassroomDTO.class);

    }

}
