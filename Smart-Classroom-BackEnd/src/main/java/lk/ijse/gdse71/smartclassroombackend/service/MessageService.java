package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.ConversationDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Conversation;
import lk.ijse.gdse71.smartclassroombackend.entity.User;

import java.util.List;

public interface MessageService {
    List<ConversationDTO> getConversationsOfUser(User user);
    ConversationDTO getConversation(User user, Long conversationId);

    ConversationDTO createConversationAndAddMessage(User sender, String receiverId, String content);
}
