package lk.ijse.gdse71.smartclassroombackend.service;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/17/2025 10:36 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendMessage(String username, String message) {
        messagingTemplate.convertAndSendToUser(username, "/queue/reply", message);
    }
}
