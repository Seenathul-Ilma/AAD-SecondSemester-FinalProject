package lk.ijse.gdse71.smartclassroombackend.service;

import java.util.List;

public interface BrevoEmailService {
    void sendEmail(String to, String subject, String body);

    void sendBulkEmail(List<String> recipients, String subject, String body);
}
