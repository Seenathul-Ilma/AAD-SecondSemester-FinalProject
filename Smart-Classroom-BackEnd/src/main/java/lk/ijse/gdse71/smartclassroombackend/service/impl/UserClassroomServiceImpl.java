package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.ClassroomRole;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.entity.UserClassroom;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.UserClassroomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

        if (lastUserClassroom != null) {
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

    @Override
    @Transactional
    public List<UserClassroomDTO> joinListOfMembersToClassroomByCode(Set<String> memberIds, String classroomCode) {
        // Fetch classroom
        Classroom classroom = classroomRepository.findByClassroomCode(classroomCode)
                .orElseThrow(() -> new RuntimeException("Classroom not found!"));

        List<UserClassroomDTO> joinedDTOs = new ArrayList<>();

        for (String memberId : memberIds) {
            // Generate manual ID
            String newId = generateNextClassroomId("REG");

            // Fetch student
            User student = userRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Student not found!"));

            // Check if already joined
            boolean alreadyJoined = userClassroomRepository.existsByUserAndClassroom(student, classroom);

            //if (alreadyJoined) continue; // skip already joined
            if (alreadyJoined) {
                continue;
                // Student already joined, skip
            }

            // Create UserClassroom
            UserClassroom userClassroom = new UserClassroom();
            userClassroom.setUserClassroomId(newId);
            userClassroom.setUser(student);
            userClassroom.setClassroom(classroom);
            userClassroom.setJoinedAt(java.time.LocalDateTime.now());
            userClassroom.setRoleInClassroom(ClassroomRole.STUDENT);
            userClassroom.setCreator(false);

            // Save
            UserClassroom savedUC = userClassroomRepository.save(userClassroom);

            // Map to DTO
            modelMapper.typeMap(UserClassroom.class, UserClassroomDTO.class)
                    .addMappings(m -> m.map(src -> src.getUser().getUserId(), UserClassroomDTO::setMemberId))
                    .addMappings(m -> m.map(src -> src.getClassroom().getClassroomId(), UserClassroomDTO::setClassroomId));

            joinedDTOs.add(modelMapper.map(savedUC, UserClassroomDTO.class));
        }

        return joinedDTOs;
    }

    @Override
    @Transactional
    //public boolean joinListOfMembersToClassroomById(Set<String> memberIds, String classroomId) {
    public List<UserClassroomDTO> joinListOfMembersToClassroomById(Set<String> memberIds, String classroomId) {
        // Fetch classroom
        Classroom classroom = classroomRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found!"));

        List<UserClassroomDTO> joinedDTOs = new ArrayList<>();
        int skippingCount = 0;
        String memberRole = ""; // to track the role for duplicate message

        for (String memberId : memberIds) {
            String newId = generateNextClassroomId("REG");
            ClassroomRole role = memberId.startsWith("TEA") ? ClassroomRole.TEACHER : ClassroomRole.STUDENT;

            if (memberRole.isEmpty()) {
                memberRole = role.toString().toLowerCase();
            }

            // Fetch member
            //User student = userRepository.findById(memberId)
            User member = userRepository.findById(memberId)
                    //.orElseThrow(() -> new RuntimeException("Student not found!"));
                    .orElseThrow(() -> new RuntimeException(
                            "The " + role.toString().toLowerCase() + " you are trying to add was not found. Please check the ID:" + memberId
                    ));

            // Check if already joined
            //boolean alreadyJoined = userClassroomRepository.existsByUserAndClassroom(student, classroom);
            boolean alreadyJoined = userClassroomRepository.existsByUserAndClassroom(member, classroom);

            // Skip if already joined
            if (alreadyJoined) {
                skippingCount += 1;
                continue;
                // Student already joined, skip
            }

            // Create and save UserClassroom
            UserClassroom userClassroom = new UserClassroom();
            userClassroom.setUserClassroomId(newId);
            //userClassroom.setUser(student);
            userClassroom.setUser(member);
            userClassroom.setClassroom(classroom);
            userClassroom.setJoinedAt(java.time.LocalDateTime.now());
            userClassroom.setRoleInClassroom(role);
            //userClassroom.setRoleInClassroom(ClassroomRole.STUDENT);
            userClassroom.setCreator(false);

            UserClassroom savedUC = userClassroomRepository.save(userClassroom);

            // Map to DTO
            joinedDTOs.add(modelMapper.map(savedUC, UserClassroomDTO.class));
        }

        if (skippingCount == memberIds.size()) {
            if (memberIds.size() > 1) {
                throw new RuntimeException("All " + memberRole + "s in the provided list are already members of this classroom.");
            } else if (memberIds.size() == 1) {
                throw new ResourceDuplicateException("The " + memberRole + " already joined this classroom.");
            }
        }

        return joinedDTOs;
        // return true
    }

    @Override
    @Transactional
    public void removeByUserClassroomId(String userClassroomId) {
        UserClassroom userClassroomToDelete = userClassroomRepository.findById(userClassroomId)
                .orElseThrow(() -> new ResourceNotFoundException("UserClassroom not found with ID: " + userClassroomId));

        userClassroomRepository.delete(userClassroomToDelete);
    }

    @Override
    @Transactional
    public void removeByUserAndClassroom(String userId, String classroomId) {
        if (!userClassroomRepository.existsByUser_UserIdAndClassroom_ClassroomId(userId, classroomId)) {
            throw new ResourceNotFoundException("Failed to remove. The user you are trying to remove is not joined to this classroom (ID: " + userId + ").");
        }
        userClassroomRepository.deleteByUser_UserIdAndClassroom_ClassroomId(userId, classroomId);
    }

    @Override
    @Transactional
    public void removeByUserAndClassroomUsingClassroomCode(String userId, String classroomCode) {
        // Fetch student
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user not found!"));

        // Fetch classroom
        Classroom classroom = classroomRepository.findByClassroomCode(classroomCode)
                .orElseThrow(() -> new RuntimeException("Classroom not found!"));

        // Check if already joined
        boolean isExist = userClassroomRepository.existsByUserAndClassroom(user, classroom);

        if (!isExist) {
            throw new ResourceNotFoundException("Failed to remove. The user you are trying to remove is not joined to this classroom (ID: " + userId + ").");
        }

        userClassroomRepository.deleteByUser_UserIdAndClassroom_ClassroomCode(userId, classroomCode);
    }

    @Override
    @Transactional
    public void removeListOfByUserClassroomId(Set<String> userClassroomIds) {
        for (String id : userClassroomIds) {
            UserClassroom userClassroomToDelete = userClassroomRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "UserClassroom not found with ID: " + id
                    ));
            userClassroomRepository.delete(userClassroomToDelete);
        }
    }

}
