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
import lk.ijse.gdse71.smartclassroombackend.exception.IllegalArgumentException;
import lk.ijse.gdse71.smartclassroombackend.repository.ConversationRepository;
import lk.ijse.gdse71.smartclassroombackend.repository.MessageRepository;
import lk.ijse.gdse71.smartclassroombackend.service.MessageService;
import lk.ijse.gdse71.smartclassroombackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
            dto.setReceiverName(c.getRecipient().getName());
            dto.setSenderName(c.getAuthor().getName());
            dto.setReceiverProfileImg(c.getRecipient().getProfileImg());
            dto.setSenderId(c.getAuthor().getUserId());

            dto.setCreatedAt(c.getCreatedAt());
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
        /*dto.setSenderId(conversation.getAuthor().getUserId());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setReceiverId(conversation.getRecipient().getUserId());*/
        dto.setReceiverName(conversation.getRecipient().getName());
        dto.setSenderName(conversation.getAuthor().getName());
        dto.setReceiverProfileImg(conversation.getRecipient().getProfileImg());
        dto.setSenderId(conversation.getAuthor().getUserId());

        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setReceiverId(conversation.getRecipient().getUserId());
        return dto;
    }


    @Override
    @Transactional
    public ConversationDTO createConversationAndAddMessage(User sender, String receiverId, String content) {
        User receiver = modelMapper.map(userService.getUserById(receiverId), User.class);

        // Try to find existing conversation in both directions
        Conversation conversation = conversationRepository
                .findByAuthorAndRecipient(sender, receiver)
                .orElseGet(() -> conversationRepository
                        .findByAuthorAndRecipient(receiver, sender)
                        .orElse(null));

        if (conversation == null) {
            // Create new conversation if none exists
            conversation = new Conversation(sender, receiver);
            conversationRepository.save(conversation);
        }

        LocalDateTime createdAt = LocalDateTime.now();

        // Add new message
        Message message = new Message(sender, receiver, conversation, content, createdAt);
        messageRepository.save(message);
        conversation.getMessages().add(message);

        //notificationService.sendMessageToConversation(conversation.getId(), message);

        // Build DTO
        ConversationDTO conversationDTO = new ConversationDTO();
        conversationDTO.setId(conversation.getId());
        conversationDTO.setCreatedAt(conversation.getCreatedAt());
        conversationDTO.setSenderId(conversation.getAuthor().getUserId());
        conversationDTO.setReceiverId(conversation.getRecipient().getUserId());

        List<MessageDTO> messageDTOs = conversation.getMessages().stream()
                .map(msg -> new MessageDTO(msg.getReceiver().getUserId(), msg.getContent(), msg.getCreatedAt(), msg.getSender().getUserId()))
                .toList();

        conversationDTO.setMessages(messageDTOs);

        return conversationDTO;
    }

    /*@Override
    @Transactional
    public ConversationDTO createConversationAndAddMessage(User sender, String receiverId, String content) {
        User receiver = modelMapper.map(userService.getUserById(receiverId), User.class);

        conversationRepository.findByAuthorAndRecipient(sender, receiver).ifPresent(conversation -> {
            throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
        });

        //conversationRepository.findByAuthorAndRecipient(sender, receiver).ifPresentOrElse(
                //conversation -> {
        //  throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
                //},
                //() -> {}
        //);

        conversationRepository.findByAuthorAndRecipient(receiver, sender).ifPresent(conversation -> {
            throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
        });

        //conversationRepository.findByAuthorAndRecipient(receiver, sender).ifPresentOrElse(
                //conversation -> {
                //    throw new ResourceDuplicateException("Conversation already exists, use the correct conversation id to send message.");
                //},
                //() -> {}
        //);

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
                .map(msg -> new MessageDTO(msg.getReceiver().getUserId(), msg.getContent(), msg.getSender().getUserId()))
                .toList();

        conversationDTO.setMessages(messageDTOs);

        return conversationDTO;
    }
*/


    /*@Override
    public MessageDTO addMessageToConversation(User sender, Long conversationId, MessageDTO messageDTO) {
        return null;
    }*/

    @Override
    @Transactional
    public MessageDTO addMessageToConversation(Long conversationId, User sender, String receiverId, String content) {
        // Fetch the receiver User entity
        User receiver = modelMapper.map(userService.getUserById(receiverId), User.class);

        // Fetch the conversation
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Check if sender is part of the conversation
        if (!conversation.getAuthor().getUserId().equals(sender.getUserId())
                && !conversation.getRecipient().getUserId().equals(sender.getUserId())) {
            throw new AccessDeniedException("User not authorized to send message to this conversation");
        }

        // Check if receiver is part of the conversation
        if (!conversation.getAuthor().getUserId().equals(receiver.getUserId())
                && !conversation.getRecipient().getUserId().equals(receiver.getUserId())) {
            throw new IllegalArgumentException("Receiver is not part of this conversation");
        }

        LocalDateTime createdAt = LocalDateTime.now();

        Message message = new Message(sender, receiver, conversation, content, createdAt);
        messageRepository.save(message);

        conversation.getMessages().add(message);

        // notificationService.sendMessageToConversation(conversation.getId(), message);

        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setReceiverId(receiver.getUserId());
        messageDTO.setCreatedAt(message.getCreatedAt());
        messageDTO.setContent(message.getContent());
        messageDTO.setSenderId(sender.getUserId()); // optional, good for frontend

        return messageDTO;
    }


    @Override
    @Transactional
    public MessageDTO markMessageAsRead(Long messageId, User reader) {
        /*Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getReceiver().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("User not authorized to mark message as read");
        }

        if (!message.getIsRead()) {
            message.setIsRead(true);
            messageRepository.save(message);
            //notificationService.sendMessageToConversation(message.getConversation().getId(), message);
        }*/

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Only the recipient can mark it as read
        if (!message.getReceiver().getUserId().equals(reader.getUserId())) {
            throw new IllegalArgumentException("User not authorized to mark this message as read");
        }

        message.setIsRead(true);
        messageRepository.save(message);

        return modelMapper.map(message, MessageDTO.class);
    }
}
