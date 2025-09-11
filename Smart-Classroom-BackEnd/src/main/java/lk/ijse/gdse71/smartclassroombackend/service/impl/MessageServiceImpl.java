package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.dto.ConversationDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.MessageDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.UserDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Conversation;
import lk.ijse.gdse71.smartclassroombackend.entity.Message;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.exception.AccessDeniedException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceDuplicateException;
import lk.ijse.gdse71.smartclassroombackend.exception.ResourceNotFoundException;
import lk.ijse.gdse71.smartclassroombackend.repository.ConversationRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.MessageRepository;
import lk.ijse.gdse71.smartclassroombackend.service.MessageService;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/10/2025 9:50 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ModelMapper modelMapper;
    private final UserService userService;

    @Override
    public List<ConversationDTO> getConversationsOfUser(User user) {
        List<Conversation> conversations = conversationRepository.findByAuthorOrRecipient(user, user);
        return conversations.stream().map(c -> {
            ConversationDTO dto = modelMapper.map(c, ConversationDTO.class);
            dto.setSenderId(c.getAuthor().getUserId());
            dto.setReceiverId(c.getRecipient().getUserId());
            return dto;
        }).toList();
    }

    @Override
    public ConversationDTO getConversation(User user, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found..!"));

        if (!conversation.getAuthor().getUserId().equals(user.getUserId()) &&
                !conversation.getRecipient().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("User not authorized to view conversation..!");
        }

        ConversationDTO dto = modelMapper.map(conversation, ConversationDTO.class);
        dto.setSenderId(conversation.getAuthor().getUserId());
        dto.setReceiverId(conversation.getRecipient().getUserId());
        return dto;
    }

    @Override
    @Transactional
    public ConversationDTO createConversationAndAddMessage(User sender, String receiverId, String content) {
        User receiver = modelMapper.map(userService.getUserById(receiverId), User.class);

        conversationRepository.findByAuthorAndRecipient(sender, receiver).ifPresent(conversation -> {
            throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
        });

        /*conversationRepository.findByAuthorAndRecipient(sender, receiver).ifPresentOrElse(
                conversation -> {
                    throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
                },
                () -> {}
        );  */

        conversationRepository.findByAuthorAndRecipient(receiver, sender).ifPresent(conversation -> {
            throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
        });

        /*conversationRepository.findByAuthorAndRecipient(receiver, sender).ifPresentOrElse(
                conversation -> {
                    throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
                },
                () -> {}
        );*/

        Conversation conversation = new Conversation(sender, receiver);
        conversationRepository.save(conversation);

        Message message = new Message(sender, receiver, conversation, content);
        messageRepository.save(message);

        conversation.getMessages().add(message);

        //notificationService.sendConversationToUsers(sender.getUserId(), receiver.getUserId(), conversation);

        ConversationDTO conversationDTO = new ConversationDTO();
        conversationDTO.setId(conversation.getId());
        conversationDTO.setSenderId(sender.getUserId());
        conversationDTO.setReceiverId(receiver.getUserId());

        List<MessageDTO> messageDTOs = conversation.getMessages().stream()
                .map(msg -> new MessageDTO(msg.getReceiver().getUserId(), msg.getContent()))
                .toList();

        conversationDTO.setMessages(messageDTOs);

        return conversationDTO;
    }
}
