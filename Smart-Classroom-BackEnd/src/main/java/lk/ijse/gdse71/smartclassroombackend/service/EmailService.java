package lk.ijse.gdse71.smartclassroombackend.service;

import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;

import java.io.IOException;

public interface EmailService {

    void sendUserEmail(String to, String subject, String body) throws IOException, MessagingException;
}
