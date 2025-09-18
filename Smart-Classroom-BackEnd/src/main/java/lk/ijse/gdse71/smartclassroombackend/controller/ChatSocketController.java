package lk.ijse.gdse71.smartclassroombackend.controller;

import lk.ijse.gdse71.smartclassroombackend.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/16/2025 10:16 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

/*
@Controller
@RequiredArgsConstructor
public class ChatSocketController {


    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> message, StompHeaderAccessor headerAccessor) {

        Principal principal = headerAccessor.getUser();
        System.out.println("UserName: "+ principal.getName());
        if (principal == null) {
            System.out.println("❌ Unauthenticated user");
            return;
        }

        String senderId = principal.getName();
        String receiverId = (String) message.get("receiverId");
        String content = (String) message.get("content");
        String conversationId = (String) message.get("conversationId");

        if (receiverId == null || content == null || conversationId == null) {
            System.out.println("❌ Invalid message payload");
            return;
        }

        // Build message payload
        Map<String, Object> payload = Map.of(
                "conversationId", conversationId,
                "senderId", senderId,
                "receiverId", receiverId,
                "content", content,
                "createdAt", System.currentTimeMillis()
        );

        // Send to receiver
        simpMessagingTemplate.convertAndSendToUser(receiverId, "/queue/messages", payload);

        // Optional: send copy back to sender
        simpMessagingTemplate.convertAndSendToUser(senderId, "/queue/messages", payload);

        System.out.println("✅ Message sent from {} to {}"+ senderId + "-" +receiverId);
    }

    // Optional: typing indicator
    @MessageMapping("/chat.typing")
    public void typing(@Payload Map<String, Object> typingData, StompHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        String senderId = principal.getName();
        String receiverId = (String) typingData.get("receiverId");
        Boolean isTyping = (Boolean) typingData.get("isTyping");
        String conversationId = (String) typingData.get("conversationId");

        if (receiverId == null || isTyping == null || conversationId == null) return;

        Map<String, Object> payload = Map.of(
                "conversationId", conversationId,
                "senderId", senderId,
                "receiverId", receiverId,
                "isTyping", isTyping,
                "timestamp", System.currentTimeMillis()
        );

        simpMessagingTemplate.convertAndSendToUser(receiverId, "/queue/typing", payload);
    }


*/


    /*@MessageMapping("/chat.sendMessage")
    public void sendMessage(MessageDTO message, Principal principal) {
        message.setSenderId(principal.getName()); // set sender

        // Send only to the receiver
        simpMessagingTemplate.convertAndSendToUser(
                message.getReceiverId(),
                "/queue/messages",
                message
        );
    }
    */


    // client sends to /app/chat.sendMessage
    /*@MessageMapping("/chat.sendMessage")
    @SendTo("/topic/messages")  // broadcast to all subscribers
    public MessageDTO sendMessage(MessageDTO message) {
        // you can persist message here if needed
        return message;
    }*/
//}

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {

    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> message,
                            StompHeaderAccessor headerAccessor,
                            Principal directPrincipal) {

        // Try multiple ways to get the authenticated user
        Principal principal = getAuthenticatedUser(headerAccessor, directPrincipal);

        if (principal == null) {
            log.warn("❌ Unauthenticated user - principal is null");
            System.out.println("❌ Unauthenticated user - principal is null");
            return;
        }

        String senderId = principal.getName();
        log.info("✅ Authenticated user: {}", senderId);
        System.out.println("✅ UserName: " + senderId);

        String receiverId = (String) message.get("receiverId");
        String content = (String) message.get("content");
        String conversationId = (String) message.get("conversationId");

        if (receiverId == null || content == null || conversationId == null) {
            log.warn("❌ Invalid message payload - missing required fields");
            System.out.println("❌ Invalid message payload");
            return;
        }

        // Build message payload
        Map<String, Object> payload = Map.of(
                "conversationId", conversationId,
                "senderId", senderId,
                "receiverId", receiverId,
                "content", content,
                "createdAt", System.currentTimeMillis()
        );

        try {
            // Send to receiver
            simpMessagingTemplate.convertAndSendToUser(receiverId, "/queue/messages", payload);
            log.debug("📤 Message sent to receiver: {}", receiverId);

            // Optional: send copy back to sender for confirmation
            simpMessagingTemplate.convertAndSendToUser(senderId, "/queue/messages", payload);
            log.debug("📤 Message confirmation sent to sender: {}", senderId);

            log.info("✅ Message sent from {} to {}", senderId, receiverId);
            System.out.println("✅ Message sent from " + senderId + " to " + receiverId);

        } catch (Exception e) {
            log.error("❌ Failed to send message: {}", e.getMessage(), e);
            System.out.println("❌ Failed to send message: " + e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload Map<String, Object> typingData,
                       StompHeaderAccessor headerAccessor,
                       Principal directPrincipal) {

        Principal principal = getAuthenticatedUser(headerAccessor, directPrincipal);

        if (principal == null) {
            log.warn("❌ Unauthenticated typing request");
            System.out.println("❌ Unauthenticated typing request");
            return;
        }

        String senderId = principal.getName();
        String receiverId = (String) typingData.get("receiverId");
        Boolean isTyping = (Boolean) typingData.get("isTyping");
        String conversationId = (String) typingData.get("conversationId");

        if (receiverId == null || isTyping == null || conversationId == null) {
            log.warn("❌ Invalid typing payload");
            return;
        }

        Map<String, Object> payload = Map.of(
                "conversationId", conversationId,
                "senderId", senderId,
                "receiverId", receiverId,
                "isTyping", isTyping,
                "timestamp", System.currentTimeMillis()
        );

        try {
            simpMessagingTemplate.convertAndSendToUser(receiverId, "/queue/typing", payload);
            log.debug("📝 Typing indicator sent: {} -> {}, typing={}", senderId, receiverId, isTyping);
        } catch (Exception e) {
            log.error("❌ Failed to send typing indicator: {}", e.getMessage());
        }
    }

    /**
     * Helper method to get authenticated user from multiple sources
     */
    private Principal getAuthenticatedUser(StompHeaderAccessor headerAccessor, Principal directPrincipal) {
        // Method 1: Try direct Principal parameter
        if (directPrincipal != null) {
            log.debug("🎯 Got Principal from direct parameter: {}", directPrincipal.getName());
            return directPrincipal;
        }

        // Method 2: Try from StompHeaderAccessor
        Principal headerPrincipal = headerAccessor.getUser();
        if (headerPrincipal != null) {
            log.debug("🎯 Got Principal from header accessor: {}", headerPrincipal.getName());
            return headerPrincipal;
        }

        // Method 3: Try from session attributes (our backup method)
        String username = (String) headerAccessor.getSessionAttributes().get("WEBSOCKET_USERNAME");
        if (username != null) {
            log.debug("🎯 Got username from session attributes: {}", username);
            return new Principal() {
                @Override
                public String getName() {
                    return username;
                }
            };
        }

        // Method 4: Try stored Principal from session attributes
        Principal storedPrincipal = (Principal) headerAccessor.getSessionAttributes().get("WEBSOCKET_USER_PRINCIPAL");
        if (storedPrincipal != null) {
            log.debug("🎯 Got Principal from session attributes: {}", storedPrincipal.getName());
            return storedPrincipal;
        }

        log.warn("❌ Could not find authenticated user from any source");
        return null;
    }
}