package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.*;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.IllegalArgumentException;
import lk.ijse.gdse71.smartclassroombackend.repository.ClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserClassroomRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.UserRepository;
import lk.ijse.gdse71.smartclassroombackend.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private final UserClassroomRepository userClassroomRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    @Override
    public Page<ClassroomDTO> getClassroomsByPaginated(int page, int size) {
        // Pass role first, then pageable
        Page<Classroom> classroomPage = classroomRepository.findAll(PageRequest.of(page, size));

        // Map each User entity to UserDTO
        return classroomPage.map(classroom -> modelMapper.map(classroom, ClassroomDTO.class));
    }

    public String generateNextClassroomId(String prefix) {
        String year = String.valueOf(LocalDate.now().getYear());
        String fullPrefix = prefix + year;   // CLS + 2025  / REG + 2025

        int nextSequence = 1;

        if (prefix.equals("CLS")) {
            Classroom lastClassroom = classroomRepository.findTopByOrderByClassroomIdDesc();
            if (lastClassroom != null) {
                String lastId = lastClassroom.getClassroomId();   // CLS20250015
                nextSequence = Integer.parseInt(lastId.substring(fullPrefix.length())) + 1;
            }
        } else if (prefix.equals("REG")) {
            UserClassroom lastUserClassroom = userClassroomRepository.findTopByOrderByUserClassroomIdDesc();
            if (lastUserClassroom != null) {
                String lastId = lastUserClassroom.getUserClassroomId(); // REG20250003
                nextSequence = Integer.parseInt(lastId.substring(fullPrefix.length())) + 1;
            }
        }

        return fullPrefix + String.format("%04d", nextSequence); // CLS20250001 / REG20250001
    }

    @Override
    @Transactional
    public ClassroomDTO saveClassroom(ClassroomDTO classroomDTO, String creatingTeacherId) {
        String newId = generateNextClassroomId("CLS");
        classroomDTO.setClassroomId(newId);

        if (classroomDTO.getClassLevel() == null || classroomDTO.getSubject() == null) {
            throw new IllegalArgumentException("Class-level and Subject are required!");
        }

        Classroom classroom = modelMapper.map(classroomDTO, Classroom.class);

        // Generate classroomCode only if not present
        if (classroom.getClassroomCode() == null || classroom.getClassroomCode().isEmpty()) {
            classroom.setClassroomCode(generateUniqueClassroomCode());
        }

        //return classroomRepository.save(classroom);
        Classroom savedClassroom = classroomRepository.save(classroom);

        //User creatingTeacher = userRepository.findById(creatingTeacherId).orElseThrow(() -> new ResourceNotFoundException("Teacher not found..!"));
        //User creatingTeacher = userRepository.findUserByUserIdAndRole(creatingTeacherId, Role.TEACHER).orElseThrow(() -> new AccessDeniedException("Only a verified teacher can create a classroom"));
        User creatingTeacher = userRepository.findUserByUserIdAndRoleIn(creatingTeacherId, List.of(Role.TEACHER, Role.ADMIN))
                .orElseThrow(() -> new AccessDeniedException("You don't have access to create classroom."));

        UserClassroom joinClassroom = new UserClassroom();
        String newUserClassroomId = generateNextClassroomId("REG");
        joinClassroom.setUserClassroomId(newUserClassroomId);
        joinClassroom.setUser(creatingTeacher);
        joinClassroom.setClassroom(savedClassroom);
        joinClassroom.setRoleInClassroom(ClassroomRole.TEACHER);
        joinClassroom.setCreator(true);
        joinClassroom.setJoinedAt(LocalDateTime.now());

        userClassroomRepository.save(joinClassroom);
        //return modelMapper.map(savedClassroom, ClassroomDTO.class);

        ClassroomDTO dto = modelMapper.map(savedClassroom, ClassroomDTO.class);
        dto.setCreatorId(creatingTeacherId);

        return dto;
    }

    private String generateUniqueClassroomCode() {
        String code;
        do {
            code = Classroom.generateRandomClassroomCode();
        } while (classroomRepository.existsByClassroomCode(code));
        return code;
    }

    @Override
    @Transactional
    public ClassroomDTO updateClassroom(ClassroomDTO classroomDTO, String updatingUserId)  {
        Classroom existing = classroomRepository.findById(classroomDTO.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        boolean isCreator =
                userClassroomRepository.existsByUser_UserIdAndClassroom_ClassroomIdAndIsCreatorTrue(
                        updatingUserId,
                        classroomDTO.getClassroomId()
                );

        Role userRole = userRepository.findById(updatingUserId)
                .map(User::getRole)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));

        // Only allow deletion if user is creator or an ADMIN
        if (!isCreator && userRole != Role.ADMIN) {
            throw new AccessDeniedException("Access denied: Only the creator or an admin can delete this classroom.");
        }

        if (classroomDTO.getClassLevel() == null || classroomDTO.getSubject() == null) {
            throw new IllegalArgumentException("Class-level and Subject are required!");
        }
        // Only update editable fields
        existing.setClassLevel(classroomDTO.getClassLevel());
        existing.setSubject(classroomDTO.getSubject());
        existing.setDescription(classroomDTO.getDescription());

        // classroomCode remains unchanged
        //return classroomRepository.save(existing);
        Classroom updatedClassroom = classroomRepository.save(existing);

        // Map to response DTO to hide userClassrooms
        return modelMapper.map(updatedClassroom, ClassroomDTO.class);
    }

    @Override
    public List<ClassroomDTO> getAllClassrooms() {
        List<Classroom> classrooms = classroomRepository.findAll();
        if (classrooms.isEmpty()){
            throw new ResourceNotFoundException("No Classrooms found..!");
        }
        return modelMapper.map(classrooms, new TypeToken<List<ClassroomDTO>>(){}.getType());
    }

    @Override
    @Transactional
    public boolean deleteClassroom(String classroomId, String deletingUserId) {
        // Check classroom existence first
        Classroom classroomToDelete = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("No classroom found..!"));

        // Ensure the deleting user is the creator of this classroom
        boolean isCreator = userClassroomRepository.existsByUser_UserIdAndClassroom_ClassroomIdAndIsCreatorTrue(
                deletingUserId,
                classroomId
        );

        Role userRole = userRepository.findById(deletingUserId)
                .map(User::getRole)
                .orElseThrow(() -> new ResourceNotFoundException("User not found..!"));

        // Only allow deletion if user is creator or an ADMIN
        if (!isCreator && userRole != Role.ADMIN) {
            throw new AccessDeniedException("Access denied: Only the creator or an admin can delete this classroom.");
        }

        // Perform deletion
        classroomRepository.delete(classroomToDelete);
        return true;
    }

    /*@Override
    @Transactional
    public boolean deleteClassroom(String id) {
        Classroom classroomToDelete = classroomRepository.findById(id).orElse(null);

        if (classroomToDelete == null) {
            throw new ResourceNotFoundException("No classroom found..!");
            //return false;
        }

        classroomRepository.delete(classroomToDelete);
        return true; // deletion successful
    }*/

    @Override
    public ClassroomDTO getClassroomById(String classroomId) {
        Classroom foundClassroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find classroom with id: " + classroomId));

        return modelMapper.map(foundClassroom, ClassroomDTO.class);

    }

    @Override
    public ClassroomDTO getClassroomByCode(String classroomCode) {
        Classroom foundClassroom =  classroomRepository.findByClassroomCode(classroomCode)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find classroom with code: " + classroomCode));

        return modelMapper.map(foundClassroom, ClassroomDTO.class);
    }

    @Override
    public Page<ClassroomDTO> getClassroomsByRole(String userId, Role role, int page, int size) {
        if (role == Role.ADMIN) {
            // Admin sees all classrooms
            return classroomRepository.findAll(PageRequest.of(page, size))
                    .map(c -> {
                        ClassroomDTO dto = modelMapper.map(c, ClassroomDTO.class);
                        userClassroomRepository.findByClassroom_ClassroomIdAndIsCreatorTrue(c.getClassroomId())
                                .ifPresent(uc -> dto.setCreatorId(uc.getUser().getUserId()));
                        return dto;
                    });
        } else {
            // Students and Teachers only their joined classrooms
            Page<UserClassroom> userClassrooms =
                    userClassroomRepository.findByUser_UserId(userId, PageRequest.of(page, size));

            return userClassrooms.map(uc -> {
                ClassroomDTO dto = modelMapper.map(uc.getClassroom(), ClassroomDTO.class);
                if (uc.isCreator()) {
                    dto.setCreatorId(userId); // mark them as creator if true
                } else {
                    userClassroomRepository.findByClassroom_ClassroomIdAndIsCreatorTrue(uc.getClassroom().getClassroomId())
                            .ifPresent(cuc -> dto.setCreatorId(cuc.getUser().getUserId()));
                }
                return dto;
            });
        }
    }


}
