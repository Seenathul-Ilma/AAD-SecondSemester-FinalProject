package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.ConversationDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.MessageDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.service.MessageService;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/10/2025 9:51 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@CrossOrigin // to allow frontend
@RestController
@RequestMapping("/api/v1/edusphere/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final ModelMapper modelMapper;

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse> getConversations(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        System.out.println("User Conversations: "+ principal);
        UserDTO userDTO = userService.getUserByEmail(principal.getUsername());

        User user = modelMapper.map(userDTO, User.class);

        List<ConversationDTO> conversations = messageService.getConversationsOfUser(user);
        return ResponseEntity.ok(new ApiResponse(200, "Conversations retrieved successfully", conversations));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse> getConversation(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
                                                       @PathVariable Long conversationId) {

        UserDTO userDTO = userService.getUserByEmail(principal.getUsername());

        User user = modelMapper.map(userDTO, User.class);

        ConversationDTO conversation = messageService.getConversation(user, conversationId);
        return ResponseEntity.ok(new ApiResponse(200, "Conversation retrieved successfully", conversation));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse> createConversation(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
            @RequestBody MessageDTO messageDTO) {

        // principal.getUsername() contains the email of the authenticated user
        UserDTO senderDTO = userService.getUserByEmail(principal.getUsername());

        User sender = modelMapper.map(senderDTO, User.class);

        ConversationDTO conversation = messageService.createConversationAndAddMessage(
                sender,
                messageDTO.getReceiverId(),
                messageDTO.getContent()
        );

        return ResponseEntity.ok(new ApiResponse(201, "Conversation created successfully", conversation));
    }

}
