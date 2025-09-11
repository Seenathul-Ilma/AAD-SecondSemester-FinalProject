package lk.ijse.gdse71.smartclassroombackend.service.impl;

import lk.ijse.gdse71.smartclassroombackend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/10/2025 10:54 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    /*@Override
    public List<ConversationDTO> getConversationsOfUser(User user) {
        List<Conversation> conversations = conversationRepository.findBySenderOrReceiver(user, user);

        if (conversations.isEmpty()) {
            return new ArrayList<>(); // safer than throwing exception
        }

        List<ConversationDTO> dtoList = new ArrayList<>();
        for (Conversation c : conversations) {
            ConversationDTO dto = modelMapper.map(c, ConversationDTO.class);

            List<Message> messages = messageRepository.findByConversationOrderBySentAtAsc(c);
            dto.setMessages(messages.stream()
                    .map(m -> modelMapper.map(m, MessageDTO.class))
                    .toList());

            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public ConversationDTO getConversation(User user, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found..!"));

        // only participants can view
        if (!conversation.getSender().getUserId().equals(user.getUserId()) &&
                !conversation.getReceiver().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("User not authorized to view conversation..!");
        }

        List<Message> messages = messageRepository.findByConversationOrderBySentAtAsc(conversation);
        ConversationDTO dto = modelMapper.map(conversation, ConversationDTO.class);
        dto.setMessages(messages.stream()
                .map(m -> modelMapper.map(m, MessageDTO.class))
                .toList());

        return dto;
    }

    @Override
    public ConversationDTO startConversation(User sender, String receiverId, String initialMessage) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found..!"));

        // Check if conversation already exists
        Optional<Conversation> existing = conversationRepository.findBySenderAndReceiver(sender, receiver);
        Conversation conversation;
        if (existing.isPresent()) {
            conversation = existing.get();
        } else {
            conversation = new Conversation();
            conversation.setSender(sender);
            conversation.setReceiver(receiver);
            conversation = conversationRepository.save(conversation);
        }

        // Save first message
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(initialMessage);
        message.setSentAt(LocalDateTime.now());
        messageRepository.save(message);

        ConversationDTO dto = modelMapper.map(conversation, ConversationDTO.class);
        dto.setMessages(List.of(modelMapper.map(message, MessageDTO.class)));

        return dto;
    }

    //@Override
    public MessageDTO sendMessage(User sender, Long conversationId, String text) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found..!"));

        // only participants can send
        if (!conversation.getSender().getUserId().equals(sender.getUserId()) &&
                !conversation.getReceiver().getUserId().equals(sender.getUserId())) {
            throw new AccessDeniedException("User not authorized to send message..!");
        }

        // Determine receiver
        User receiver = conversation.getSender().getUserId().equals(sender.getUserId())
                ? conversation.getReceiver()
                : conversation.getSender();

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(text);
        message.setSentAt(LocalDateTime.now());
        messageRepository.save(message);

        return modelMapper.map(message, MessageDTO.class);
    }*/
}
