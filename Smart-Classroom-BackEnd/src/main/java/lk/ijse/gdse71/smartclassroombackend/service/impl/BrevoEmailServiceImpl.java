package lk.ijse.gdse71.smartclassroombackend.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lk.ijse.gdse71.smartclassroombackend.service.BrevoEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/29/2025 8:06 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Service
public class BrevoEmailServiceImpl implements BrevoEmailService {

    @Autowired
    private JavaMailSender mailSender;

    //@Async
    public void sendEmail(String to, String subject, String body) {

        try {
            MimeMessage message = mailSender.createMimeMessage();

            message.setFrom(new InternetAddress("seenathulilma121243@gmail.com"));
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject(subject);

            message.setContent(body, "text/html; charset=utf-8");

            mailSender.send(message);
        } catch (AddressException e) {
            System.err.println("AddressException: Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException(e);
        } catch (MessagingException e) {
            System.err.println("MessagingException: Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException(e);
        }

        /*try{
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("seenathulilma121243@gmail.com"); // Must be verified in Brevo
            //message.setFrom("95cd54001@smtp-brevo.com"); // your Gmail address
            message.setReplyTo("seenathulilma121243@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent to " + to);
        } catch (MailException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException(e);
        }*/
    }

    @Async
    public void sendBulkEmail(List<String> recipients, String subject, String body) {
        for (String email : recipients) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("seenathulilma121243@gmail.com"); // same as username
                mailSender.send(message);
                System.out.println("Email sent successfully to: " + email);
            } catch (Exception e) {
                System.err.println("Failed to send email to: " + email + " | Error: " + e.getMessage());
            }
        }
    }
}